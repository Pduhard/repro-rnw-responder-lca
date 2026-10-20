# react-native-web: a move onto a sibling of the responder never asks their parent

A press starts on `A`, and `A` becomes the responder. The mouse moves onto `B`, a sibling of `A`. Their parent has `onMoveShouldSetResponder` (here through `PanResponder`). It is asked on every move over `A`, but never once the pointer is over `B`, so it can never take the gesture there.

In the demo, the parent takes a drag only once it is longer than `A` is wide (150px), so only while the pointer is over `B`.

It happens when:

- the parent is the outermost view with responder props (no `ScrollView` or other responder above it);
- `B` has responder props of its own.

## Run

```sh
npm install
npm run dev    # open the page, press on the middle of A, drag slowly to the far side of B, watch the log
npm run unit   # getLowestCommonAncestor on hand-made paths
node fuzz.cjs  # getLowestCommonAncestor against a naive reference, 40,000 seeded random pairs
npm run e2e    # the same drag in Chrome, in small steps (system Chrome, or CHROME_PATH)
npm run fix    # apply the fix to node_modules, then run them again
npm run unfix  # back to react-native-web as published
```

## Expected

Each `parent asked` line names the view under the pointer: `A`, `B`, or `parent` for the gap between them. The parent is asked on every move, over `A` and then over `B`, and takes the gesture once the drag is longer than `A`:

```
drag from A onto B: parent granted
  A granted
  parent asked, dx=5, over A
  ...
  parent asked, dx=90, over parent
  parent asked, dx=95, over B
  ...
  parent asked, dx=155, over B
  A terminated
  parent granted
  parent released, dx=70
```

## Actual (react-native-web 0.21.4)

No `parent asked` line is ever `over B`:

```
drag from A onto B: parent NEVER granted
  A granted
  parent asked, dx=5, over A
  ...
  parent asked, dx=90, over parent
```

`npm run unit` (FAIL lines):

```
FAIL getLowestCommonAncestor([1,0], [2,0]) = null, expected 0
FAIL getLowestCommonAncestor([1,3,0], [2,0]) = null, expected 0
```

`node fuzz.cjs` fails on every pair whose only common node is the topmost one.

## Why

The responder README says: "If something is already the responder, the negotiation event propagates to (capture) and from (bubble) the lowest common ancestor of the event target and the current responder." When `getLowestCommonAncestor` returns `null`, nobody is asked.

`src/modules/useResponderEvents/utils.js` walks both paths in lockstep:

```js
while (depth--) {
  if (itemA === itemB) {
    return itemA;
  }
  itemA = pathA[indexA++];
  itemB = pathB[indexB++];
}
```

`itemA` already holds `pathA[indexA]`, so the post-increment reads the same pair again on the first step. The loop never compares the last pair: the outermost registered node. That node is always shared (the guard above the loop checks it), so the function returns `null` exactly when it is the only common ancestor, as for `A` and `B` here.

## Fix

```js
  itemA = pathA[++indexA];
  itemB = pathB[++indexB];
```

With it, `unit`, `fuzz.cjs` (40,000/40,000) and `e2e` pass.

## Versions

- react-native-web 0.21.4 (same code on `master` and `0.22-dev`)
- react 19.2.3, Chrome
