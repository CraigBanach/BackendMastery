import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";

const SessionHeader = async () => {
  const session = await auth0.getSession();

  return (
    <div className="flex items-center gap-2">
      {session && (
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-finance-red text-finance-red hover:bg-finance-red-dark hover:text-finance-red-light"
        >
          <a href="/auth/logout">Logout</a>
        </Button>
      )}
      {!session && (
        <Button
          asChild
          size="lg"
          className="bg-finance-green hover:bg-finance-green-dark"
        >
          <a href="/auth/login">Login</a>
        </Button>
      )}
    </div>
  );
};

export default SessionHeader;
