export interface ISong {
    _id: string
    title: string
    album: string
    author: string
    audio: IFile
    image: IFile
}

interface IFile {
    url: string
        id: string
        filename: string
}