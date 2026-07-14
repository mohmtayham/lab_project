import {
  LayoutDashboard,
  Users,
  FlaskConical,
  ClipboardList,
  TestTubes,
  Microscope,
  FileBarChart,
  CreditCard,
  LifeBuoy,
  Cpu,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users, permission: 'patients.read' },
  { label: 'Orders', href: '/orders', icon: ClipboardList, permission: 'orders.read' },
  { label: 'Requests', href: '/requests', icon: FlaskConical, permission: 'requests.read' },
  { label: 'Samples', href: '/samples', icon: TestTubes, permission: 'samples.read' },
  { label: 'Results', href: '/results', icon: FileBarChart, permission: 'results.read' },
  { label: 'Tests', href: '/tests', icon: Microscope, permission: 'tests.read' },
  { label: 'Devices', href: '/devices', icon: Cpu, permission: 'devices.read' },
  { label: 'Payments', href: '/payments', icon: CreditCard, permission: 'payments.read' },
  { label: 'Support', href: '/support', icon: LifeBuoy, permission: 'support.read' },
  { label: 'Users', href: '/users', icon: UserCog, permission: 'users.read' },
];
