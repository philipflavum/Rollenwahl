import { Routes, Route } from 'react-router-dom'
import ModeratorView from './views/ModeratorView'
import ParticipantView from './views/ParticipantView'
import AdminView from './views/AdminView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ParticipantView />} />
      <Route path="/moderation" element={<ModeratorView />} />
      <Route path="/admin" element={<AdminView />} />
    </Routes>
  )
}
