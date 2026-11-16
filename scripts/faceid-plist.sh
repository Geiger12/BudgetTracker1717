#!/bin/sh
# Adds the Face ID permission text to the iPhone project. Safe to run again.
P=ios/App/App/Info.plist
[ -f "$P" ] || { echo "faceid-plist: $P not found yet (run: npx cap add ios)"; exit 0; }
T="Budget Tracker uses Face ID to keep your budgets private."
/usr/libexec/PlistBuddy -c "Set :NSFaceIDUsageDescription $T" "$P" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :NSFaceIDUsageDescription string $T" "$P"
echo "faceid-plist: Face ID text is set."
