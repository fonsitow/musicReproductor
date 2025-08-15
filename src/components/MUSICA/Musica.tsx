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
<div style={{
  alignItems: "center",
  justifyContent: "center"
}}>

  <div>
    <h3 className="font-semibold ">{song.title}
    </h3>
    <img className= "object-cover"src={song.image.url}></img>
      <p>{song.author}</p>
  </div>
  <button 
  className="bg-black text-white px-8 cursor-pointer gap-1" 
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
