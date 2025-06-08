
const savePos = () => {
    navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Сохраняем координаты в localStorage
      localStorage.setItem('userCoords', JSON.stringify(coords));
      console.log('Геолокация сохранена:', coords);
    },
    (error) => {
      console.error('Ошибка геолокации:', error.message);
    }
  );
};

const getPos = () => {
    const storedCoords = JSON.parse(localStorage.getItem('userCoords'));
    if (storedCoords) {
        return storedCoords;
    }
};

export { savePos, getPos };