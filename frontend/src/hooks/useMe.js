import { useQuery } from "@tanstack/react-query";

export function useMe() {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["me"],
    enabled: !!token, // only run if token exists
    retry: false,
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Not authenticated");
      }

      return res.json();
    },
  });
}
