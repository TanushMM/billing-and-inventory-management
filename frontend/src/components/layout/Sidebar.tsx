import {
  Package,
  Warehouse,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  LineChart,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authService } from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Sales & POS',
      items: [
        { path: '/pos', label: 'POS', icon: ShoppingCart },
        { path: '/sales', label: 'Sales', icon: LineChart },
      ],
    },
    {
      title: 'Products & Inventory',
      items: [
        { path: '/products', label: 'Products', icon: Package },
        { path: '/inventory', label: 'Inventory', icon: Warehouse },
      ],
    },
    {
      title: 'Miscellaneous',
      items: [{ path: '/customers', label: 'Customers', icon: Users }],
    },
  ];

  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(navGroups.map((g) => [g.title, true]))
  );

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-sidebar-primary tracking-tight">
            Inventory System
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navGroups.map((group) => (
          <div key={group.title}>
            {/* Group Header */}
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 py-1 mt-2 text-xs font-semibold tracking-wide text-sidebar-foreground uppercase hover:text-sidebar-primary"
              >
                {group.title}
                {openGroups[group.title] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Group Items */}
            {openGroups[group.title] && (
              <div className="space-y-1 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start rounded-md transition-colors duration-150',
                        collapsed && 'px-2',
                        isActive
                          ? 'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium border-l-4 border-sidebar-primary'
                          : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && currentUser && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.fullName}</p>
            <p className="text-xs text-sidebar-foreground/60">{currentUser.username}</p>
          </div>
        )}
        <Button
          variant="outline"
          className={cn('w-full', collapsed && 'px-2')}
          onClick={handleLogout}
        >
          <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </aside>
  );
};


// import {
//   Package,
//   Warehouse,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   ShoppingCart,
//   LineChart,
//   Users,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { authService } from '@/services/api';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useState } from 'react';

// interface SidebarProps {
//   collapsed: boolean;
//   onToggle: () => void;
// }

// export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const currentUser = authService.getCurrentUser();

//   const handleLogout = () => {
//     authService.logout();
//     navigate('/login');
//   };

//   const navGroups = [
//     {
//       title: 'Sales & POS',
//       items: [
//         { path: '/pos', label: 'POS', icon: ShoppingCart },
//         { path: '/sales', label: 'Sales', icon: LineChart },
//       ],
//     },
//     {
//       title: 'Products & Inventory',
//       items: [
//         { path: '/products', label: 'Products', icon: Package },
//         { path: '/inventory', label: 'Inventory', icon: Warehouse },
//       ],
//     },
//     // {
//     //   title: 'Goods & Expenses',
//     //   items: [
//     //     // { path: '/suppliers', label: 'Suppliers', icon: Truck },
//     //     // { path: '/grn', label: 'GRN', icon: ClipboardCheck },
//     //     // { path: '/expenses', label: 'Expenses', icon: Receipt },icon: Warehouse },
//     //   ],
//     // },
//     {
//       title: 'Miscellaneous',
//       items: [
//         { path: '/customers', label: 'Customers', icon: Users },
//       ],
//     },
//   ];

//   // Track which groups are open (all expanded initially)
//   const [openGroups, setOpenGroups] = useState(
//     Object.fromEntries(navGroups.map((g) => [g.title, true]))
//   );

//   const toggleGroup = (title: string) => {
//     setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
//   };

//   return (
//     <aside
//       className={cn(
//         'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
//         collapsed ? 'w-16' : 'w-64'
//       )}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
//         {!collapsed && (
//           <h2 className="text-lg font-semibold text-sidebar-primary">Inventory System</h2>
//         )}
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onToggle}
//           className="text-sidebar-foreground hover:bg-sidebar-accent"
//         >
//           {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
//         </Button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto p-2 space-y-1">
//         {navGroups.map((group) => (
//           <div key={group.title}>
//             {/* Group Header */}
//             {!collapsed && (
//               <button
//                 onClick={() => toggleGroup(group.title)}
//                 className="flex items-center justify-between w-full px-2 py-1 mt-2 text-xs font-semibold tracking-wide text-sidebar-foreground uppercase hover:text-sidebar-primary"
//               >
//                 {group.title}
//                 {openGroups[group.title] ? (
//                   <ChevronUp className="h-4 w-4" />
//                 ) : (
//                   <ChevronDown className="h-4 w-4" />
//                 )}
//               </button>
//             )}

//             {/* Group Items */}
//             {openGroups[group.title] && (
//               <div className="space-y-1 mt-1">
//                 {group.items.map((item) => {
//                   const Icon = item.icon;
//                   const isActive = location.pathname === item.path;

//                   return (
//                     <Button
//                       key={item.path}
//                       variant={isActive ? 'secondary' : 'ghost'}
//                       className={cn(
//                         'w-full justify-start transition-colors duration-150',
//                         collapsed && 'px-2',
//                         isActive
//                           ? 'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium border-l-4 border-sidebar-primary'
//                           : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
//                       )}
//                       onClick={() => navigate(item.path)}
//                     >
//                       <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
//                       {!collapsed && <span>{item.label}</span>}
//                     </Button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div className="p-4 border-t border-sidebar-border">
//         {!collapsed && currentUser && (
//           <div className="mb-3">
//             <p className="text-sm font-medium text-sidebar-foreground">{currentUser.fullName}</p>
//             <p className="text-xs text-sidebar-foreground/60">{currentUser.username}</p>
//           </div>
//         )}
//         <Button
//           variant="outline"
//           className={cn('w-full', collapsed && 'px-2')}
//           onClick={handleLogout}
//         >
//           <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
//           {!collapsed && 'Logout'}
//         </Button>
//       </div>
//     </aside>
//   );
// };


// // import { Package, Warehouse, LogOut, ChevronLeft, ChevronRight, ShoppingCart, LineChart, Users } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import { cn } from '@/lib/utils';
// // import { authService } from '@/services/api';
// // import { useNavigate, useLocation, Link } from 'react-router-dom';

// // interface SidebarProps {
// //   collapsed: boolean;
// //   onToggle: () => void;
// // }

// // export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const currentUser = authService.getCurrentUser();

// //   const handleLogout = () => {
// //     authService.logout();
// //     navigate('/login');
// //   };

// //   const navItems = [
// //     { path: '/pos', label: 'POS', icon: ShoppingCart },
// //     { path: '/sales', label: 'Sales', icon: LineChart },
// //     { path: '/products', label: 'Products', icon: Package },
// //     { path: '/inventory', label: 'Inventory', icon: Warehouse },
// //     { path: '/customers', label: 'Customers', icon: Users },
// //   ];

// //   return (
// //     <aside
// //       className={cn(
// //         'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
// //         collapsed ? 'w-16' : 'w-64'
// //       )}
// //     >
// //       <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
// //         {!collapsed && (
// //           <h2 className="text-lg font-semibold text-sidebar-primary">Inventory System</h2>
// //         )}
// //         <Button
// //           variant="ghost"
// //           size="icon"
// //           onClick={onToggle}
// //           className="text-sidebar-foreground hover:bg-sidebar-accent"
// //         >
// //           {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
// //         </Button>
// //       </div>

// //       <nav className="flex-1 p-2 space-y-1">
// //         {navItems.map((item) => {
// //           const Icon = item.icon;
// //           const isActive = location.pathname === item.path;
// //           return (
// //             <Button
// //               key={item.path}
// //               variant={isActive ? 'secondary' : 'ghost'}
// //               className={cn(
// //                 'w-full justify-start',
// //                 collapsed && 'px-2',
// //                 isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
// //               )}
// //               onClick={() => navigate(item.path)}
// //             >
// //               <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
// //               {!collapsed && <span>{item.label}</span>}
// //             </Button>
// //           );
// //         })}
// //       </nav>

// //       <div className="p-4 border-t border-sidebar-border">
// //         {!collapsed && currentUser && (
// //           <div className="mb-3">
// //             <p className="text-sm font-medium text-sidebar-foreground">{currentUser.fullName}</p>
// //             <p className="text-xs text-sidebar-foreground/60">{currentUser.username}</p>
// //           </div>
// //         )}
// //         <Button
// //           variant="outline"
// //           className={cn('w-full', collapsed && 'px-2')}
// //           onClick={handleLogout}
// //         >
// //           <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
// //           {!collapsed && 'Logout'}
// //         </Button>
// //       </div>
// //     </aside>
// //   );
// // };
