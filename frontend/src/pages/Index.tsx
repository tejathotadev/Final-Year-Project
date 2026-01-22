import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Navigate } from "react-router-dom";
import WorkspacePage from "@/pages/WorkspacePage";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: request } = await supabase
        .from("user_request")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      setRole(request?.role ?? "user");
      setLoading(false);
    };

    checkRole();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <WorkspacePage />;
};

export default Index;
