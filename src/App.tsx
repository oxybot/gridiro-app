export default function App() {

  const grid = {
    width: 80,
    height: 60,
  };

  return (
    <>
      <section>
        <h1>Welcome to the Gridiro Hackathon App</h1>
      </section>
      <section className="diagram">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width={grid.width} height={grid.height} patternUnits="userSpaceOnUse">
              <path className="grid" d={`M 0 ${grid.height / 2} L ${grid.width / 2} 0 ${grid.width} ${grid.height / 2} ${grid.width / 2} ${grid.height} 0 ${grid.height / 2}`} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path className="hover" d={`M 0 ${grid.height / 2} L ${grid.width / 2} 0 ${grid.width} ${grid.height / 2} ${grid.width / 2} ${grid.height} 0 ${grid.height / 2}`} />
        </svg>
      </section>
    </>
  )
}
