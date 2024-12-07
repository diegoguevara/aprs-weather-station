import net from 'net';
class AprsConnection {
  constructor(
    private readonly params: {
      callsign: string;
      ssid: string;
      passcode: string;
      server: string;
      port: string;
      lat: number;
      lon: number;
    },
  ) {}

  async connect() {
    return new Promise<net.Socket>((resolve, reject) => {
      try {
        const { callsign, ssid, passcode, server, port, lat, lon } =
          this.params;

        const filter = `r/${lat}/${lon}/100`;

        const client = net.createConnection(parseInt(port), server, () => {
          console.log(`Connected to ${server}:${port}`);
          const loginMessage = `user ${callsign}-${ssid} pass ${passcode} vers HJ3DAG-APRS-WX-V2 filter ${filter}\n`;
          client.write(loginMessage);
          resolve(client);
        });
      } catch {
        reject('Error connecting to APRS server');
      }
    });
  }
}

export default AprsConnection;
