export const OPERATOR_NAME = 'Robin Anderson';
export const OPERATOR_TITLE = 'Embedded Systems Engineer';
export const OPERATOR_LOCATION = 'Toronto, ON';
export const OPERATOR_TIMEZONE = 'America/Toronto';

export type ToolchainCategory = 'LANGUAGES' | 'DESIGN' | 'PLATFORMS' | 'PROTOCOLS' | 'DEV';

export const ACTIVE_TOOLCHAIN: ReadonlyArray<{ name: string; category: ToolchainCategory }> = [
  { name: 'C / C++', category: 'LANGUAGES' },
  { name: 'Java', category: 'LANGUAGES' },
  { name: 'Python', category: 'LANGUAGES' },
  { name: 'Rust', category: 'LANGUAGES' },
  { name: 'Verilog', category: 'DESIGN' },
  { name: 'FPGA', category: 'DESIGN' },
  { name: 'KiCad', category: 'DESIGN' },
  { name: 'OrCAD / Cadence', category: 'DESIGN' },
  { name: 'ARM Cortex', category: 'PLATFORMS' },
  { name: 'STM32', category: 'PLATFORMS' },
  { name: 'FreeRTOS', category: 'PLATFORMS' },
  { name: 'Linux (embedded)', category: 'PLATFORMS' },
  { name: 'SPI', category: 'PROTOCOLS' },
  { name: 'I2C', category: 'PROTOCOLS' },
  { name: 'UART', category: 'PROTOCOLS' },
  { name: 'CAN', category: 'PROTOCOLS' },
  { name: 'Scopes / LA', category: 'DEV' },
  { name: 'JTAG', category: 'DEV' },
  { name: 'SWD', category: 'DEV' },
  { name: 'Git / CI', category: 'DEV' },
] as const;
