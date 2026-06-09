import { Routes, Route } from 'react-router-dom'
import ModeratorView from './views/ModeratorView'
import ParticipantView from './views/ParticipantView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ParticipantView />} />
      <Route path="/moderation" element={<ModeratorView />} />
    </Routes>
  )
}
