#!/usr/bin/env node
/**
 * Motor 3 Log Parser
 * 
 * Parses server logs to extract Motor 3 metrics and generate benchmark report.
 * 
 * Usage: node scripts/parse-motor3-logs.js <log-file>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  timeoutThreshold: 25000,
  targetAvgTime: 15000,
  minSuccessRate: 0.90,
  maxTimeoutRate: 0.10,
  outputFile: 'docs/analysis/motor-3-prompt-v2-benchmarks.md',
};

// Parse command line args
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/parse-motor3-logs.js <log-file>');
  process.exit(1);
}

const logFile = args[0];

if (!fs.existsSync(logFile)) {
  console.error(`Error: Log file not found: ${logFile}`);
  process.exit(1);
}

console.log(`📊 Parsing Motor 3 logs from: ${logFile}\n`);

// Read log file
const logContent = fs.readFileSync(logFile, 'utf-8');
const lines = logContent.split('\n');

// Extract test results
const tests = [];
let currentTest = null;

for (const line of lines) {
  // Detect start of pipeline
  if (line.includes('[PIPELINE][START]')) {
    const match = line.match(/trace_id: '([^']+)'/);
    if (match) {
      currentTest = {
        traceId: match[1],
        motor3Time: null,
        result: null,
        variations: 0,
      };
    }
  }
  
  // Extract Motor 3 output
  if (currentTest && line.includes('[MOTOR-3][OUTPUT]')) {
    const timeMatch = line.match(/motor3_ms: (\d+)/);
    const variationsMatch = line.match(/variations: (\d+)/);
    
    if (timeMatch) {
      currentTest.motor3Time = parseInt(timeMatch[1], 10);
    }
    if (variationsMatch) {
      currentTest.variations = parseInt(variationsMatch[1], 10);
    }
  }
  
  // Detect timeout
  if (currentTest && line.includes('[visual-composer] AI call failed Error: TIMEOUT')) {
    currentTest.result = 'TIMEOUT';
  }
  
  // Detect validation success
  if (currentTest && line.includes('[MOTOR-3][VALIDATION]')) {
    currentTest.result = 'SUCCESS';
  }
  
  // Detect validation fail
  if (currentTest && line.includes('[MOTOR-3][VALIDATION-FAIL]')) {
    currentTest.result = 'VALIDATION_FAIL';
  }
  
  // Detect pipeline end (finalize test)
  if (currentTest && line.includes('[PIPELINE][END]')) {
    const endMatch = line.match(/trace_id: '([^']+)'/);
    if (endMatch && endMatch[1] === currentTest.traceId) {
      // Infer result if not detected
      if (!currentTest.result) {
        if (currentTest.motor3Time >= CONFIG.timeoutThreshold) {
          currentTest.result = 'TIMEOUT';
        } else if (currentTest.variations === 4) {
          currentTest.result = 'SUCCESS';
        } else {
          currentTest.result = 'VALIDATION_FAIL';
        }
      }
      
      tests.push(currentTest);
      currentTest = null;
    }
  }
}

console.log(`✅ Found ${tests.length} test results\n`);

if (tests.length === 0) {
  console.error('❌ No test results found in log file');
  process.exit(1);
}

// Calculate metrics
const validTests = tests.filter(t => t.motor3Time !== null);
const totalTests = validTests.length;

const motor3Times = validTests.map(t => t.motor3Time);
const avgMotor3Time = Math.round(motor3Times.reduce((sum, t) => sum + t, 0) / totalTests);

const timeoutCount = validTests.filter(t => t.result === 'TIMEOUT').length;
const successCount = validTests.filter(t => t.result === 'SUCCESS').length;
const validationFailCount = validTests.filter(t => t.result === 'VALIDATION_FAIL').length;

const timeoutRate = timeoutCount / totalTests;
const successRate = successCount / totalTests;

const fastestTime = Math.min(...motor3Times);
const slowestTime = Math.max(...motor3Times);

const metrics = {
  totalTests,
  avgMotor3Time,
  timeoutCount,
  timeoutRate,
  successCount,
  successRate,
  validationFailCount,
  fastestTime,
  slowestTime,
};

// Print summary
console.log('='.repeat(60));
console.log('📊 BENCHMARK SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests:        ${metrics.totalTests}`);
console.log(`Avg Motor 3 Time:   ${metrics.avgMotor3Time}ms (target: <${CONFIG.targetAvgTime}ms)`);
console.log(`Success Rate:       ${(metrics.successRate * 100).toFixed(1)}% (target: >${CONFIG.minSuccessRate * 100}%)`);
console.log(`Timeout Rate:       ${(metrics.timeoutRate * 100).toFixed(1)}% (target: <${CONFIG.maxTimeoutRate * 100}%)`);
console.log(`Fastest:            ${metrics.fastestTime}ms`);
console.log(`Slowest:            ${metrics.slowestTime}ms`);
console.log('='.repeat(60));

// Generate report
const timestamp = new Date().toISOString();

let markdown = `# Motor 3 Prompt V2 - Production Benchmark Results

**Date:** ${timestamp}  
**Total Tests:** ${metrics.totalTests}  
**Environment:** Production (GPT-5.4)  
**Log File:** ${path.basename(logFile)}

---

## 📊 Aggregated Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Average Motor 3 Time** | ${metrics.avgMotor3Time}ms | <${CONFIG.targetAvgTime}ms | ${metrics.avgMotor3Time < CONFIG.targetAvgTime ? '✅ PASS' : '❌ FAIL'} |
| **Timeout Rate** | ${(metrics.timeoutRate * 100).toFixed(1)}% | <${CONFIG.maxTimeoutRate * 100}% | ${metrics.timeoutRate < CONFIG.maxTimeoutRate ? '✅ PASS' : '❌ FAIL'} |
| **Success Rate** | ${(metrics.successRate * 100).toFixed(1)}% | >${CONFIG.minSuccessRate * 100}% | ${metrics.successRate > CONFIG.minSuccessRate ? '✅ PASS' : '❌ FAIL'} |
| **Fastest Time** | ${metrics.fastestTime}ms | - | - |
| **Slowest Time** | ${metrics.slowestTime}ms | - | - |

**Breakdown:**
- ✅ Success: ${metrics.successCount}/${metrics.totalTests} (${(metrics.successRate * 100).toFixed(1)}%)
- ⏱️ Timeout: ${metrics.timeoutCount}/${metrics.totalTests} (${(metrics.timeoutRate * 100).toFixed(1)}%)
- ⚠️ Validation Fail: ${metrics.validationFailCount}/${metrics.totalTests}

---

## 📋 Detailed Results

| # | Trace ID | Motor3 Time | Result | Variations |
|---|----------|-------------|--------|------------|
`;

tests.forEach((t, idx) => {
  const icon = t.result === 'SUCCESS' ? '✅' : t.result === 'TIMEOUT' ? '⏱️' : '❌';
  markdown += `| ${idx + 1} | ${t.traceId.substring(0, 8)}... | ${t.motor3Time}ms | ${icon} ${t.result} | ${t.variations} |\n`;
});

markdown += `\n---

## 🎯 Decision Matrix

`;

const checks = [
  { name: 'Average time <15s', pass: metrics.avgMotor3Time < CONFIG.targetAvgTime },
  { name: 'Timeout rate <10%', pass: metrics.timeoutRate < CONFIG.maxTimeoutRate },
  { name: 'Success rate >90%', pass: metrics.successRate > CONFIG.minSuccessRate },
];

checks.forEach(check => {
  markdown += `- [${check.pass ? 'x' : ' '}] ${check.name}\n`;
});

const passCount = checks.filter(c => c.pass).length;
const decision = passCount >= 2 ? 'GO' : 'NO-GO';

markdown += `\n**Decision: ${decision}** (${passCount}/3 criteria met)\n\n`;

if (decision === 'GO') {
  markdown += `### ✅ GO - Merge Prompt V2

Prompt V2 optimization is **SUCCESSFUL**:
- Performance improved significantly
- Timeout rate acceptable
- Success rate meets target

**Actions:**
1. Commit all changes (service.ts, prompts-v2.ts, tests, docs)
2. Delegate push to @devops
3. Mark Story 4.5.2 + V2 optimization as DONE

`;
} else {
  markdown += `### ❌ NO-GO - Rollback to V1

Prompt V2 optimization **DID NOT MEET** minimum criteria.

**Actions:**
1. Rollback to V1 (revert commit)
2. Implement Story 4.5.4 (timeout increase + retry logic)
3. Consider alternative: Motor divided into parallel calls

**Fallback Strategy:**
- Increase timeout 25s → 45s
- Add retry logic (1 attempt)
- If still failing: divide Motor 3 into multiple GPT calls

`;
}

markdown += `---

## 📝 Notes

**Baseline (V1):**
- Average time: 22.8s
- Timeout rate: 75%
- Success rate: 25%

**Improvement:**
- Time: ${((1 - metrics.avgMotor3Time / 22800) * 100).toFixed(1)}% ${metrics.avgMotor3Time < 22800 ? 'faster' : 'slower'}
- Timeout: ${((0.75 - metrics.timeoutRate) * 100).toFixed(1)}pp ${metrics.timeoutRate < 0.75 ? 'reduction' : 'increase'}
- Success: ${((metrics.successRate - 0.25) * 100).toFixed(1)}pp ${metrics.successRate > 0.25 ? 'increase' : 'decrease'}

---

*Generated by: scripts/parse-motor3-logs.js*  
*Source: ${logFile}*  
*Timestamp: ${timestamp}*
`;

// Write report
const outputPath = path.join(process.cwd(), CONFIG.outputFile);
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log(`\n📄 Report saved to: ${CONFIG.outputFile}`);

// Print decision
console.log('\n' + '='.repeat(60));
if (decision === 'GO') {
  console.log('✅ DECISION: GO - MERGE PROMPT V2');
  console.log(`${passCount}/3 criteria met - Optimization SUCCESSFUL`);
} else {
  console.log('❌ DECISION: NO-GO - ROLLBACK TO V1');
  console.log(`${passCount}/3 criteria met - Optimization FAILED`);
}
console.log('='.repeat(60));
console.log();
