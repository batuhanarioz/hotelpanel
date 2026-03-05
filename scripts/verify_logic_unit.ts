
// scripts/verify_logic_unit.ts
// This script verifies the DATE OVERLAP logic used in the RPC function
// Rule: (New.In < Old.Out) AND (New.Out > Old.In)

interface Interval {
    in: string;
    out: string;
}

function checkOverlap(newInt: Interval, oldInt: Interval): boolean {
    const newIn = new Date(newInt.in).getTime();
    const newOut = new Date(newInt.out).getTime();
    const oldIn = new Date(oldInt.in).getTime();
    const oldOut = new Date(oldInt.out).getTime();

    // The logic used in RPC: new.check_in_at < old.check_out_at AND new.check_out_at > old.check_in_at
    return (newIn < oldOut) && (newOut > oldIn);
}

const tests = [
    {
        name: "Case A1: Back-to-back (No overlap)",
        existing: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T12:00:00Z" },
        new: { in: "2026-03-10T12:00:00Z", out: "2026-03-10T14:00:00Z" },
        expected: false
    },
    {
        name: "Case A2: Partial Overlap",
        existing: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T12:00:00Z" },
        new: { in: "2026-03-10T11:00:00Z", out: "2026-03-10T13:00:00Z" },
        expected: true
    },
    {
        name: "Case A3: Fully Inside",
        existing: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T14:00:00Z" },
        new: { in: "2026-03-10T11:00:00Z", out: "2026-03-10T12:00:00Z" },
        expected: true
    },
    {
        name: "Case A4: Exact Match",
        existing: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T12:00:00Z" },
        new: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T12:00:00Z" },
        expected: true
    },
    {
        name: "Edge Case: Start touches End",
        existing: { in: "2026-03-10T10:00:00Z", out: "2026-03-10T12:00:00Z" },
        new: { in: "2026-03-10T08:00:00Z", out: "2026-03-10T10:00:00Z" },
        expected: false
    }
];

console.log("🧪 Verifying Overlap Logic Unit Tests...");
let allPassed = true;
tests.forEach(t => {
    const result = checkOverlap(t.new, t.existing);
    const passed = result === t.expected;
    console.log(`${passed ? "✅" : "❌"} ${t.name}: Result=${result}, Expected=${t.expected}`);
    if (!passed) allPassed = false;
});

if (allPassed) {
    console.log("\n✨ All date logic unit tests passed!");
} else {
    console.log("\n🚨 Some tests failed.");
}
