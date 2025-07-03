import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    setLoading(false);

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) throw error;
    return user;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signIn, signOut };
};
