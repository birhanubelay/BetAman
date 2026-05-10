export async function GET() {
  const demoListings = [
    {
      id: 'demo-1',
      location: 'Bole District',
      price: 15000,
      description: '3-bed modern house, furnished, available now',
      brokerWallet: '8pPhvJwMzwBNwbJzwGqZwV9H1RzqYW8TJzH5vKqvv2K7'
    },
    {
      id: 'demo-2',
      location: 'Summit Area',
      price: 12000,
      description: 'Luxury apartment, newly renovated, diplomatic area',
      brokerWallet: '7uH2vK8nL4mP9rQ5sT1wX3yZ'
    },
    {
      id: 'demo-3',
      location: 'Sarbet',
      price: 25000,
      description: 'Premium villa with garden, secure compound',
      brokerWallet: '5kG3jF7eD1aL9mQ8rS0vW4x'
    }
  ];

  return Response.json(demoListings);
}
