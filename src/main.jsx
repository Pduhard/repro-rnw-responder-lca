import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PanResponder, Text, View } from "react-native";

const SIZE = 150;

// A parent that takes over a horizontal drag longer than A is wide, so only
// while the pointer is over B. Its two children, A and B, each become the
// responder when a press starts on them.
function App() {
  const [log, setLog] = useState([]);
  const push = (line) => setLog((lines) => [...lines, line]);
  const pushRef = useRef(push);
  pushRef.current = push;

  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, { dx }) => {
        pushRef.current(`parent asked, dx=${Math.round(dx)}`);
        return Math.abs(dx) > SIZE;
      },
      onPanResponderGrant: () => pushRef.current("parent granted"),
      onPanResponderRelease: (_e, { dx }) => pushRef.current(`parent released, dx=${Math.round(dx)}`),
    }),
  );

  const child = (label, color) => (
    <View
      testID={label}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => push(`${label} granted`)}
      onResponderTerminate={() => push(`${label} terminated`)}
      style={{ width: SIZE, height: SIZE, backgroundColor: color, justifyContent: "center" }}
    >
      <Text style={{ textAlign: "center" }}>{label}</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <View testID="parent" {...pan.panHandlers} style={{ flexDirection: "row", gap: 20, padding: 20, backgroundColor: "#eee", alignSelf: "flex-start", userSelect: "none" }}>
        {child("A", "#9cf")}
        {child("B", "#fc9")}
      </View>
      <Text testID="log">{log.join("\n")}</Text>
    </View>
  );
}

createRoot(document.getElementById("root")).render(<App />);
