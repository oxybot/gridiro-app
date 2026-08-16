import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import { useAppReducer } from "./appReducer";

export default function App() {
  const [state, dispatch] = useAppReducer();

  return (
    <>
      <section>
        <h1>Gridiro App <small>Hackathon</small></h1>
      </section>
      <section className="diagram" onClick={() => dispatch({ type: "closeMenu" })}>
        <DiagramCanvas
          state={state}
          dispatch={dispatch}
        />
        <DiagramOverlays
          menu={state.menu}
          pan={state.pan}
          editing={state.editing}
          dispatch={dispatch}
        />
      </section>
    </>
  );
}
