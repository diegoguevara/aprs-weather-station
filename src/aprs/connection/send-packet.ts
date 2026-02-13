import type net from 'net';
import logger from '../../utils/logger';

export function sendPacket(conn: net.Socket, packet: string): void {
  try {
    conn.write(`${packet}\n`);
  } catch (error) {
    logger.error('Error sending packet', { error });
  }
}
