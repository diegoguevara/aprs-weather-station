import net from 'net';
import logger from '../../utils/logger';

interface AprsConnectionConfig {
  callsign: string;
  ssid: string;
  passcode: string;
  server: string;
  port: number;
  lat: number;
  lon: number;
  version: string;
}

const RECONNECT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 15000;

/**
 * Manages a persistent TCP connection to an APRS-IS server.
 * Handles login verification (waits for "logresp" from server),
 * automatic reconnection on disconnect, and connection timeouts.
 */
export default class AprsConnection {
  private client: net.Socket | null = null;
  private connected = false;
  private connecting = false;
  private intentionalClose = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private readonly params: AprsConnectionConfig) {}

  /** Opens a TCP connection and authenticates with the APRS-IS server. Resolves once login is verified. */
  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;
    this.connecting = true;
    this.intentionalClose = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    return new Promise<void>((resolve, reject) => {
      const { callsign, ssid, passcode, server, port, lat, lon, version } = this.params;
      const filter = `r/${lat}/${lon}/100`;
      let settled = false;

      this.client = net.createConnection(port, server);

      let loginBuffer = '';

      this.client.on('connect', () => {
        logger.info(`Connected to ${server}:${port}`);
        const loginMessage = `user ${callsign}-${ssid} pass ${passcode} vers APDAGW ${version} filter ${filter}\n`;
        this.client!.write(loginMessage);
      });

      const onLoginData = (data: Buffer) => {
        loginBuffer += data.toString();
        logger.debug(`APRS: ${data.toString().trim()}`);

        if (loginBuffer.includes('logresp')) {
          this.client!.removeListener('data', onLoginData);

          if (
            loginBuffer.includes('verified') &&
            !loginBuffer.includes('unverified')
          ) {
            this.client!.setTimeout(0);
            this.connected = true;
            this.connecting = false;
            this.client!.on('data', (d) => {
              logger.debug(`APRS: ${d.toString().trim()}`);
            });
            if (!settled) {
              settled = true;
              resolve();
            }
          } else {
            this.connecting = false;
            if (!settled) {
              settled = true;
              reject(new Error('APRS login unverified - check passcode'));
            }
          }
        }
      };

      this.client.on('data', onLoginData);

      this.client.on('error', (err) => {
        logger.error('APRS connection error', { error: err.message });
        this.connecting = false;
        if (!settled) {
          settled = true;
          reject(err);
        }
      });

      this.client.on('close', () => {
        const wasConnected = this.connected;
        this.connected = false;
        this.connecting = false;
        this.client = null;
        if (wasConnected) {
          logger.info('APRS connection closed');
        }
        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      });

      this.client.setTimeout(CONNECTION_TIMEOUT);
      this.client.on('timeout', () => {
        logger.error('APRS connection timed out');
        this.connecting = false;
        this.client?.destroy();
        if (!settled) {
          settled = true;
          reject(new Error('APRS connection timed out'));
        }
      });
    });
  }

  /** Sends a raw APRS packet string to the server. Silently skips if not connected. */
  send(packet: string): void {
    if (!this.connected || !this.client) {
      logger.warn('Cannot send packet: not connected');
      return;
    }
    try {
      this.client.write(`${packet}\n`);
    } catch (error) {
      logger.error('Error sending packet', { error });
    }
  }

  /** Closes the connection and prevents auto-reconnect. */
  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connected = false;
    this.connecting = false;
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  /** Schedules a reconnection attempt after RECONNECT_INTERVAL ms. On failure, the close event re-triggers this. */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.intentionalClose) return;
    logger.info(`Reconnecting in ${RECONNECT_INTERVAL / 1000}s...`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
        logger.info('Reconnected to APRS server');
      } catch (error) {
        logger.error('Reconnection failed', {
          error: (error as Error).message,
        });
      }
    }, RECONNECT_INTERVAL);
  }
}
