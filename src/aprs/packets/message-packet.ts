import { latLonToAprs } from '../../utils/lat-lon';
import logger from '../../utils/logger';

/**
 * Builds an APRS status/message packet.
 * If lat/lon are provided, sends a position packet with the comment.
 * Otherwise, sends a status-only packet.
 */
export function buildMessagePacket({
  callsign,
  ssid,
  lat,
  lon,
  comment = '',
}: {
  callsign: string;
  ssid: string;
  lat?: number;
  lon?: number;
  comment?: string;
}): string | undefined {
  try {
    const paddedCallsign = `${callsign}-${ssid}`.padEnd(9, ' ');

    let aprsMessage = `${paddedCallsign}>APDAGW,TCPIP*:>${comment}`;

    if (lat && lon) {
      const symbolTable = '/';
      const symbolCode = '#';
      const { latString, lonString } = latLonToAprs(lat, lon);
      aprsMessage = `${paddedCallsign}>APDAGW,TCPIP*:!${latString}${symbolTable}${lonString}${symbolCode}${comment}`;
    }

    return aprsMessage;
  } catch (error) {
    logger.error('Error building message packet', { error });
  }
}
