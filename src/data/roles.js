export const INITIAL_ROLES = [
  {
    id: 'gastgeberin',
    title: 'Gastgeber:in',
    seats: 1,
    candidates: [
      { name: 'Anjli', type: 'fremd' },
      { name: 'Fiona', type: 'fremd' },
      { name: 'Isabel', type: 'fremd' },
      { name: 'Lea', type: 'fremd' },
      { name: 'Manuela', type: 'fremd' },
      { name: 'Nicolas', type: 'fremd' },
      { name: 'Renata', type: 'fremd' },
      { name: 'Valerie', type: 'fremd' },
    ],
    status: 'setup',
    voteCount: 0,
  },
  {
    id: 'dokumentarin',
    title: 'Dokumentar:in',
    seats: 1,
    candidates: [
      { name: 'Fiona', type: 'fremd' },
      { name: 'Ivo', type: 'fremd' },
      { name: 'Leonie', type: 'fremd' },
      { name: 'Manuela', type: 'fremd' },
      { name: 'Nicolas', type: 'fremd' },
    ],
    status: 'setup',
    voteCount: 0,
  },
  {
    id: 'lernbegleitung',
    title: 'Lern-Begleitung',
    seats: 1,
    candidates: [
      { name: 'Anjli', type: 'selbst' },
      { name: 'Ivo', type: 'fremd' },
      { name: 'Lea', type: 'fremd' },
      { name: 'Manuela', type: 'fremd' },
      { name: 'Sarah', type: 'selbst' },
    ],
    status: 'setup',
    voteCount: 0,
  },
  {
    id: 'moderation',
    title: 'Moderation',
    seats: 2,
    candidates: [
      { name: 'Fiona', type: 'fremd' },
      { name: 'Isabel', type: 'selbst' },
      { name: 'Lea', type: 'fremd' },
      { name: 'Nicolas', type: 'fremd' },
    ],
    status: 'setup',
    voteCount: 0,
  },
]

export const PLENUM = [
  'Alan', 'Andreas', 'Anjli', 'Barbara', 'Che', 'Fiona',
  'Isabel', 'Ivo', 'Jacqueline', 'Laetitia', 'Lea', 'Leonie',
  'Luzia', 'Manuela', 'Michel', 'Monika', 'Nicolas', 'Noémi',
  'Renata', 'Sarah', 'Tatjana', 'Valerie',
]

export const TOTAL_VOTERS = 25
