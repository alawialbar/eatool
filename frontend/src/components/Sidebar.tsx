import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  AppWindow,
  Target,
  Cpu,
  Database,
  Cable,
  Grid3x3,
  Waypoints,
  Search,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import type { EntityType } from "@/types";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Applications", icon: AppWindow, to: "/applications" },
  {
    label: "Business Capabilities",
    icon: Target,
    to: "/business-capabilities",
  },
  {
    label: "Technology Components",
    icon: Cpu,
    to: "/technology-components",
  },
  { label: "Data Objects", icon: Database, to: "/data-objects" },
  { label: "Integrations", icon: Cable, to: "/integrations" },
  { label: "Landscape Matrix", icon: Grid3x3, to: "/landscape" },
  { label: "Integration Map", icon: Waypoints, to: "/integration-map" },
];

const entityTypeLabels: Record<EntityType, string> = {
  BusinessCapability: "Business Capabilities",
  Application: "Applications",
  TechnologyComponent: "Technology Components",
  DataObject: "Data Objects",
  Integration: "Integrations",
};

const entityTypeRoutes: Record<EntityType, string> = {
  BusinessCapability: "/business-capabilities",
  Application: "/applications",
  TechnologyComponent: "/technology-components",
  DataObject: "/data-objects",
  Integration: "/integrations",
};

interface SearchResultItem {
  id: string;
  name: string;
  entityType: EntityType;
}

type SearchResults = Record<string, SearchResultItem[]>;

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const response = await api.get("/search", {
        params: { q: debouncedQuery },
      });
      return response.data.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleResultClick = useCallback(
    (item: SearchResultItem) => {
      const route = entityTypeRoutes[item.entityType];
      navigate(`${route}/${item.id}`);
      setShowResults(false);
      setSearchQuery("");
    },
    [navigate]
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResults(false);
      }
    },
    []
  );

  const hasResults =
    results &&
    Object.values(results).some((items) => items.length > 0);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      className={`flex flex-col bg-slate-900 text-slate-300 transition-all duration-200 ${
        collapsed ? "w-16" : "w-[250px]"
      }`}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Logo / title */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <Building2 size={24} className="shrink-0 text-white" />
        {!collapsed && (
          <span className="text-lg font-semibold text-white">EA Tool</span>
        )}
      </div>

      {/* Search input */}
      <div className="px-3 pb-4">
        {collapsed ? (
          <div className="flex h-8 w-full items-center justify-center rounded bg-slate-800">
            <Search size={16} className="text-slate-500" />
          </div>
        ) : (
          <div className="relative" ref={searchRef}>
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowResults(true);
              }}
              onKeyDown={handleKeyDown}
              className="h-8 w-full rounded bg-slate-800 pl-8 pr-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-slate-600"
            />

            {/* Search results dropdown */}
            {showResults && debouncedQuery.length >= 2 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 rounded-md shadow-lg border border-slate-700 max-h-[300px] overflow-y-auto z-50">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                  </div>
                ) : !hasResults ? (
                  <div className="px-3 py-3 text-sm text-slate-400 text-center">
                    No results found
                  </div>
                ) : (
                  Object.entries(results!).map(([type, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <div key={type}>
                        <div className="text-xs text-slate-400 uppercase px-3 py-1 font-medium">
                          {entityTypeLabels[type as EntityType] || type}
                        </div>
                        {items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleResultClick(item)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                          >
                            <span className="text-sm text-slate-200">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        )}
        {collapsed && (
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
