import { createRequire } from "node:module"; import assert from "node:assert/strict";
const { planReminders, hasReal } = createRequire(import.meta.url)("../www/native.js");
const now = new Date(2026, 10, 15, 8, 0, 0);               // Sun Nov 15 2026, 8:00
const items = [
  { id: "phone", type: "bill", name: "Phone", amount: 55, freq: "monthly", day: 15 },
  { id: "rent", type: "bill", name: "Rent", amount: 1350, freq: "monthly", day: 1 },
  { id: "gym", type: "bill", name: "Gym", amount: 30, freq: "monthly", day: 10 },
  { id: "pay", type: "income", name: "Paycheck", amount: 2150, freq: "biweekly", anchor: "2026-11-13" },
  { id: "fun", type: "variable", name: "Fun", amount: 80 },
  { id: "cc", type: "bill", name: "Card", amount: 200, freq: "monthly", day: 31 }];
const data = { budgets: {
  a: { name: "Home", items, pay: { "phone_2026-11-15": { item: "phone", amt: 55 } } },
  s: { name: "Example budget", sample: true, items: [{ id: "x", type: "bill", name: "Sample", amount: 1, freq: "monthly", day: 16 }], pay: {} } } };
const plan = planReminders(data, now);
const on = (p, mo, d) => p.at.getMonth() === mo && p.at.getDate() === d;
assert.ok(!plan.some((p) => /Sample/.test(p.body)), "sample budget is skipped");
assert.ok(!plan.some((p) => /Paycheck|Fun/.test(p.body)), "income and everyday spending are skipped");
assert.ok(!plan.some((p) => /Phone/.test(p.body) && on(p, 10, 15)), "a bill marked paid gets no reminder");
assert.ok(!plan.some((p) => /Gym/.test(p.body) && p.at.getMonth() === 10), "a past due date gets no reminder");
assert.ok(plan.some((p) => p.title === "Bill due tomorrow" && /Card/.test(p.body) && on(p, 10, 29)), "Card on the 31st clamps to Nov 30, reminder Nov 29");
assert.ok(plan.some((p) => p.title === "Bill due today" && /Rent/.test(p.body) && on(p, 11, 1)), "Rent Dec 1 due-today reminder");
assert.ok(plan.every((p, i) => i === 0 || plan[i - 1].at <= p.at), "sorted by time");
assert.ok(plan.every((p) => p.at > now && p.at.getHours() === 9), "all in the future, at 9:00");
assert.ok(plan.every((p) => !/\$/.test(p.body)), "no amounts on the lock screen");
assert.equal(new Set(plan.map((p) => p.id)).size, plan.length, "unique ids");
const unpaid = { budgets: { a: { name: "Home", items: [items[0]], pay: {} } } };
assert.ok(planReminders(unpaid, now).some((p) => p.title === "Bill due today" && on(p, 10, 15)), "unpaid bill today gets a 9:00 reminder when it is 8:00");
assert.equal(planReminders(unpaid, new Date(2026, 10, 15, 10, 0, 0)).filter((p) => on(p, 10, 15)).length, 0, "after 9:00 there is no same-day reminder");
const big = { budgets: { a: { name: "Big", pay: {}, items: Array.from({ length: 40 }, (_, i) => ({ id: "b" + i, type: "bill", name: "B" + i, amount: 1, freq: "monthly", day: (i % 28) + 1 })) } } };
assert.ok(planReminders(big, now).length <= 60, "capped under the iOS limit of 64");
assert.equal(hasReal(JSON.stringify(data)), true); assert.equal(hasReal(JSON.stringify({ budgets: { s: { sample: true } } })), false); assert.equal(hasReal("nope"), false);
console.log("native.test: all checks passed (" + plan.length + " reminders planned in the main case)");
