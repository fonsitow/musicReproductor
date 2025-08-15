import { create } from 'zustand';
import type { ISong } from '../components/types/songs';

export const MusicStore = create(
    function (set): {
        song: null | ISong,
        actualizar: (newSong: ISong) => void
    }
{
    return {
            song: null,
            actualizar: function (newSong) {
                set({
                    song: newSong
                })
            }
        }
})
   