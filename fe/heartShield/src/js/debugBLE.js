async function debugMovesenseCharacteristics() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Movesense' }],
        optionalServices: ['heart_rate', '0000fdf3-0000-1000-8000-00805f9b34fb']
      });
  
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
  
      for (const service of services) {
        console.log(`🔧 Service: ${service.uuid}`);
  
        const characteristics = await service.getCharacteristics();
  
        for (const char of characteristics) {
          console.log(`  🔹 Characteristic: ${char.uuid}`);
          console.log(`     ▸ Properties:`,
            Object.entries(char.properties)
              .filter(([_, val]) => val)
              .map(([key]) => key)
              .join(', ')
          );
        }
      }
  
    } catch (err) {
      console.error('🔴 BLE debug failed:', err);
    }
};

export { debugMovesenseCharacteristics };
  