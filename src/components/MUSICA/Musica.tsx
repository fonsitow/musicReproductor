import { useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5"
import type { ISong } from "../types/songs";
import { MusicStore } from "../../store/store";


interface props {
    song: ISong
}

function Music ({song }: props) {

    const [play, setPlay] = useState(false);

  const { actualizar } = MusicStore()

 //funcion del boton al hacer click
    function handlerClickPlay () {
        setPlay(function(state) {return !state })
        
        actualizar(song)
    }

return (
<div className="bg-white/10 backdrop-blur-lg border border-white/20 
             rounded-2xl p-6 text-center text-lg 
             shadow-lg transition transform hover:scale-105 hover:shadow-purple-400/30">

  <div>
    <h3 className="font-semibold ">{song.title}
    </h3>
    <img className= "object-cover"src={song.image.url}></img>
      <p>{song.author}</p>
  </div>
  <button 
  className="bg-black text-white px-8 cursor-pointer gap-1 border rounded-lg hover:bg-gray-800 transition-colors duration-300" 
  onClick={handlerClickPlay}>
  {
    play ?
      <><IoPause /></>:
      <><IoPlay /></>
  }
  </button>
</div>
)
}

export default Music
