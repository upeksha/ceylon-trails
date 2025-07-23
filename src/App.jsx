import MapContainer from './components/MapContainer'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <MapContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App
