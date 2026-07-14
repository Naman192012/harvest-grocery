export default defineEventHandler(() => {
  return { message: 'API working!', timestamp: new Date().toISOString() };
});
