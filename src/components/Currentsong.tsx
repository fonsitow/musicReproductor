import { MusicStore } from "../store/store";


function CurrentSong () {
      const { song } = MusicStore()
      return (
        <>
        <audio src={song?.audio.url} controls autoPlay></audio>
        </>
      )
}

export default CurrentSong