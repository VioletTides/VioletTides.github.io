import { Project } from '../types';
import { IMAGES } from '../constants/images';

export const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'QUANTUM_NAV_OS',
    desc: 'Real-time operating system for autonomous drone swarm navigation. Implements advanced Kalman filtering for sensor fusion and path planning in high-density obstacles.',
    stack: ['C++', 'RTOS', 'FPGA'],
    status: 'STABLE',
    thumbnail: IMAGES.PROJECTS.QUANTUM_NAV
  },
  {
    id: '02',
    title: 'GRID_SYNC_KERNEL',
    desc: 'Smart grid load balancing firmware with micro-second latency. Manages distributed energy resources across large-scale industrial power networks.',
    stack: ['Rust', 'Embedded Linux'],
    status: 'DELEGATED',
    thumbnail: IMAGES.PROJECTS.GRID_SYNC
  },
  {
    id: '03',
    title: 'BIO_SENSOR_ARRAY',
    desc: 'High-throughput signal processing for wearable medical devices. Features low-power consumption design and high-fidelity ADC sampling algorithms.',
    stack: ['ARM Cortex-M4', 'DSP'],
    status: 'ACTIVE',
    thumbnail: IMAGES.PROJECTS.BIO_SENSOR
  },
  {
    id: '04',
    title: 'NEURAL_EMBED_CORE',
    desc: 'Lightweight neural network inference engine optimized for edge devices. Enables on-device machine learning with minimal memory footprint.',
    stack: ['C', 'TensorFlow Lite', 'MCU'],
    status: 'ACTIVE',
    thumbnail: IMAGES.PROJECTS.NEURAL_EMBED
  }
];
