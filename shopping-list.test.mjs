// Created: 2026-04-26
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_URL = `file://${path.join(__dirname, 'index.html')}`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(FILE_URL);

// ─── 테스트 1: 아이템 추가 (버튼 클릭) ─────────────────────────────────────
console.log('\n📋 테스트 1: 아이템 추가 (버튼 클릭)');
await clearStorage(page);

await page.fill('#itemInput', '사과');
await page.click('button.add-btn');

const items1 = await page.$$('li');
assert(items1.length === 1, '아이템 1개 추가됨');

const text1 = await page.textContent('li .item-text');
assert(text1.trim() === '사과', '추가된 아이템 텍스트가 "사과"');

const inputVal = await page.inputValue('#itemInput');
assert(inputVal === '', '추가 후 입력창 초기화됨');

// ─── 테스트 2: 아이템 추가 (Enter 키) ────────────────────────────────────────
console.log('\n📋 테스트 2: 아이템 추가 (Enter 키)');

await page.fill('#itemInput', '바나나');
await page.press('#itemInput', 'Enter');

const items2 = await page.$$('li');
assert(items2.length === 2, 'Enter로 두 번째 아이템 추가됨');

// ─── 테스트 3: 여러 아이템 추가 ─────────────────────────────────────────────
console.log('\n📋 테스트 3: 여러 아이템 추가');

await page.fill('#itemInput', '우유');
await page.press('#itemInput', 'Enter');
await page.fill('#itemInput', '계란');
await page.press('#itemInput', 'Enter');

const items3 = await page.$$('li');
assert(items3.length === 4, '총 4개 아이템 존재');

// ─── 테스트 4: 빈 입력 무시 ──────────────────────────────────────────────────
console.log('\n📋 테스트 4: 빈 입력 무시');

await page.fill('#itemInput', '   ');
await page.click('button.add-btn');

const items4 = await page.$$('li');
assert(items4.length === 4, '빈 입력은 추가되지 않음');

// ─── 테스트 5: 체크 기능 ─────────────────────────────────────────────────────
console.log('\n📋 테스트 5: 체크 기능 (완료/미완료 토글)');

const firstCheckbox = await page.$('li:last-child input[type="checkbox"]');
const checkedBefore = await firstCheckbox.isChecked();
assert(!checkedBefore, '초기 상태: 체크 해제됨');

await firstCheckbox.click();
const checkedAfter = await page.$eval('li:last-child input[type="checkbox"]', el => el.checked);
assert(checkedAfter, '클릭 후: 체크됨');

const hasCheckedClass = await page.$eval('li:last-child', el => el.classList.contains('checked'));
assert(hasCheckedClass, '체크된 아이템에 .checked 클래스 적용됨');

const hasStrikethrough = await page.$eval('li:last-child .item-text', el => {
  return window.getComputedStyle(el).textDecorationLine.includes('line-through');
});
assert(hasStrikethrough, '체크된 아이템 텍스트에 취소선 적용됨');

await page.click('li:last-child input[type="checkbox"]');
const reUnchecked = await page.$eval('li:last-child input[type="checkbox"]', el => el.checked);
assert(!reUnchecked, '재클릭 후: 체크 해제됨');

// ─── 테스트 6: 아이템 삭제 ──────────────────────────────────────────────────
console.log('\n📋 테스트 6: 아이템 삭제');

const countBefore = (await page.$$('li')).length;
await page.click('li:last-child .del-btn');
const countAfter = (await page.$$('li')).length;
assert(countAfter === countBefore - 1, `삭제 후 아이템 수: ${countBefore} → ${countAfter}`);

// ─── 테스트 7: 통계 표시 ────────────────────────────────────────────────────
console.log('\n📋 테스트 7: 통계 표시');

await clearStorage(page);
await page.fill('#itemInput', '딸기');
await page.press('#itemInput', 'Enter');
await page.fill('#itemInput', '포도');
await page.press('#itemInput', 'Enter');
await page.click('li:last-child input[type="checkbox"]');

const statsText = await page.textContent('#stats');
assert(statsText.includes('총 2개'), `통계에 "총 2개" 포함: "${statsText.trim()}"`);
assert(statsText.includes('완료 1개'), `통계에 "완료 1개" 포함`);
assert(statsText.includes('미완료 1개'), `통계에 "미완료 1개" 포함`);

// ─── 테스트 8: 필터 — 미완료 ────────────────────────────────────────────────
console.log('\n📋 테스트 8: 필터 — 미완료');

await page.click('button[data-filter="active"]');
const activeItems = await page.$$('li');
assert(activeItems.length === 1, '미완료 필터: 1개만 표시');

const activeHasCheckedClass = await page.$eval('li', el => el.classList.contains('checked'));
assert(!activeHasCheckedClass, '미완료 필터에 체크된 아이템 없음');

// ─── 테스트 9: 필터 — 완료 ──────────────────────────────────────────────────
console.log('\n📋 테스트 9: 필터 — 완료');

await page.click('button[data-filter="done"]');
const doneItems = await page.$$('li');
assert(doneItems.length === 1, '완료 필터: 1개만 표시');

const doneHasCheckedClass = await page.$eval('li', el => el.classList.contains('checked'));
assert(doneHasCheckedClass, '완료 필터에 체크된 아이템만 표시');

// ─── 테스트 10: 필터 — 전체 ─────────────────────────────────────────────────
console.log('\n📋 테스트 10: 필터 — 전체');

await page.click('button[data-filter="all"]');
const allItems = await page.$$('li');
assert(allItems.length === 2, '전체 필터: 2개 모두 표시');

// ─── 테스트 11: 완료 항목 일괄 삭제 ────────────────────────────────────────
console.log('\n📋 테스트 11: 완료 항목 일괄 삭제');

const clearBtnVisible = await page.isVisible('.clear-btn');
assert(clearBtnVisible, '"완료 항목 모두 삭제" 버튼이 표시됨');

await page.click('.clear-btn');
const afterClear = await page.$$('li');
assert(afterClear.length === 1, '완료 항목 삭제 후 1개만 남음');

const clearBtnHidden = !(await page.isVisible('.clear-btn'));
assert(clearBtnHidden, '완료 항목 없으면 삭제 버튼 숨겨짐');

// ─── 테스트 12: localStorage 영속성 ────────────────────────────────────────
console.log('\n📋 테스트 12: localStorage 영속성 (새로고침 후 데이터 유지)');

await page.fill('#itemInput', '새로고침 테스트');
await page.press('#itemInput', 'Enter');
const beforeReload = (await page.$$('li')).length;

await page.reload();
const afterReload = (await page.$$('li')).length;
assert(afterReload === beforeReload, `새로고침 후 아이템 수 유지: ${afterReload}개`);

// ─── 결과 요약 ──────────────────────────────────────────────────────────────
await browser.close();

console.log('\n' + '═'.repeat(50));
console.log(`결과: ${passed + failed}개 테스트 중 ✅ ${passed}개 통과, ❌ ${failed}개 실패`);
console.log('═'.repeat(50));

if (failed > 0) process.exit(1);
