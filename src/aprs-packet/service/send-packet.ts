import type net from 'net';
class SendPacket {
  constructor() {}

  static async send(conn: net.Socket, packet: string) {
    try {
      conn.write(`${packet}\n`);
    } catch (error) {
      console.log(error);
    }
  }
}

export default SendPacket;
