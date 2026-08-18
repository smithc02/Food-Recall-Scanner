export function healthFixture() {
  return { status: "ok" as const, service: "web" as const };
}
