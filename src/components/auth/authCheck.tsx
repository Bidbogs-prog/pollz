// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";

// export function AuthCheck() {
//   const router = useRouter();
//   const [sessionStatus, setSessionStatus] = useState<string>("Checking...");

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const {
//           data: { session },
//           error,
//         } = await supabase.auth.getSession();

//         console.log("Auth Check Status:", {
//           hasSession: !!session,
//           userId: session?.user?.id,
//           error: error?.message,
//         });

//         setSessionStatus(session ? "Has session" : "No session");

//         if (session) {
//           // Add delay before redirect to see the logs
//           await new Promise((resolve) => setTimeout(resolve, 1000));
//           router.push("/");
//         }
//       } catch (error) {
//         console.error("Auth check error:", error);
//         setSessionStatus("Error checking session");
//       }
//     };

//     // Initial check
//     checkAuth();

//     // Also listen for auth state changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log("Auth state changed:", { event, userId: session?.user?.id });
//       checkAuth();
//     });

//     return () => subscription.unsubscribe();
//   }, [router]);

//   // Return the status for debugging
//   return <div className="text-sm text-gray-500">{sessionStatus}</div>;
// }
