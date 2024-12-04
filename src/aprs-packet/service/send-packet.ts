class SendPacket {
  constructor() {}

  static async send(packet: string) {
    try {
      console.log(packet);
    } catch (error) {
      console.log(error);
    }
  }
}

export default SendPacket;
