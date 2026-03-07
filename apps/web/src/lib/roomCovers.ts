interface RoomCover {
  image?: string;
  background: string;
}

const defaultCover: RoomCover = {
  background: 'linear-gradient(135deg, #f4ecdf 0%, #e6d3b5 100%)',
};

const roomCovers: Record<string, RoomCover> = {
  Cocina: {
    image: '/rooms/cocina.png',
    background: 'linear-gradient(135deg, #f6e6ce 0%, #e7b77d 100%)',
  },
  Salón: {
    image: '/rooms/salon.png',
    background: 'linear-gradient(135deg, #e3dbc8 0%, #c1a77f 100%)',
  },
  'Dormitorio principal': {
    image: '/rooms/habitacion.png',
    background: 'linear-gradient(135deg, #e8e0d2 0%, #bda58a 100%)',
  },
  'Dormitorio secundario': {
    image: '/rooms/habitacion2.png',
    background: 'linear-gradient(135deg, #f0e7dc 0%, #cfbaa0 100%)',
  },
  'Baño principal': {
    image: '/rooms/baño1.png',
    background: 'linear-gradient(135deg, #dce9ee 0%, #9db9c7 100%)',
  },
  'Baño de invitados': {
    image: '/rooms/baño2.png',
    background: 'linear-gradient(135deg, #d8e4ea 0%, #adc5d0 100%)',
  },
  Trastero: {
    image: '/rooms/trastero.png',
    background: 'linear-gradient(135deg, #e4decd 0%, #b6a98a 100%)',
  },
  Entrada: {
    image: '/rooms/entrada.png',
    background: 'linear-gradient(135deg, #efe6d8 0%, #cab89a 100%)',
  },
  Estudio: {
    image: '/rooms/estudio.png',
    background: 'linear-gradient(135deg, #e4e2da 0%, #b8b39f 100%)',
  },
  Otro: {
    image: '/rooms/jardin.png',
    background: 'linear-gradient(135deg, #e4e2da 0%, #b8b39f 100%)',
  },
};

export function getRoomCover(roomName: string): RoomCover {
  return roomCovers[roomName] ?? defaultCover;
}
