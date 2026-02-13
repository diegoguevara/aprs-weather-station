import net from 'net';
import logger from '../../utils/logger';

export function connectToAprs(params: {
  callsign: string;
  ssid: string;
  passcode: string;
  server: string;
  port: string;
  lat: number;
  lon: number;
}): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const { callsign, ssid, passcode, server, port, lat, lon } = params;
    const filter = `r/${lat}/${lon}/100`;

    const client = net.createConnection(parseInt(port), server, () => {
      logger.info(`Connected to ${server}:${port}`);
      const loginMessage = `user ${callsign}-${ssid} pass ${passcode} vers HJ3DAG-APRS-WX-V2 filter ${filter}\n`;
      client.write(loginMessage);
      resolve(client);
    });

    client.on('error', (err) => {
      logger.error('APRS connection error', { error: err.message });
      reject(err);
    });

    client.on('close', () => {
      logger.info('APRS connection closed');
    });

    client.setTimeout(10000);
    client.on('timeout', () => {
      logger.error('APRS connection timed out');
      client.destroy();
      reject(new Error('APRS connection timed out'));
    });
  });
}
