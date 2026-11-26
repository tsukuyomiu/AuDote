import { useState } from 'react';
import { selectPhotos } from '../services/mediaService';
export function useMedia() { const [mediaError, setMediaError] = useState(''); const [selecting, setSelecting] = useState(false); async function pick(multiple = false) { setSelecting(true); setMediaError(''); try { return await selectPhotos(multiple); } catch (error) { setMediaError(error instanceof Error ? error.message : 'Não foi possível selecionar a foto.'); return []; } finally { setSelecting(false); } } return { pick, mediaError, selecting }; }
