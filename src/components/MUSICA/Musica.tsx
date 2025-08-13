import { useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5"
import type Musica from "./Musica.astro";


interface props {
    title: string;
    list: string;
}

function Music ({title, list}: props) {

    const [play, setPlay] = useState(false);

 //funcion del boton al hacer click
    function handlerClickPlay () {
        setPlay(function(state) {return !state })
    }

return (
<div className="flex items-center gap-12">
  <div>
    <h3 className="font-semibold">{title}
    </h3>
    <ul>
      {list}
      </ul>
  </div>
  <button 
  className="bg-purple-700 text-white px-6 rounded-full font-serif cursor-pointer flex items-center gap-1" 
  onClick={handlerClickPlay}>
  {
    play ?
      <>pause <IoPause /></>:
      <>play <IoPlay /></>
  }
  </button>
</div>
)
}

export default Music
