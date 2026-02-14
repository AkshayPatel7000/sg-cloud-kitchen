import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-none">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
          <p className="text-muted-foreground mt-2 font-medium">
            Thank you for your order. We've received your payment and are now
            preparing your delicious meal.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
          <div className="bg-muted/50 p-4 rounded-xl border border-dashed border-muted-foreground/30">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">
              Order ID
            </p>
            <p className="text-xl font-mono font-bold mt-1 text-primary">
              {orderId}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/" className="block">
              <Button
                className="w-full h-12 text-lg font-bold shadow-lg"
                size="lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Return to Menu
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground">
              A receipt has been sent to your email. You can track your order
              status in the admin panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
