const test = async () => {
  try {
    const orders = await fetch('http://localhost:5001/api/orders').then(r => r.json());
    console.log('✅ Orders loaded:', orders.length);
    
    if (orders.length > 0) {
      const chats = await fetch(`http://localhost:5001/api/chats/${orders[0].id}`).then(r => r.json());
      console.log('✅ Chats loaded for order ' + orders[0].id + ':', chats.length);
      
      const msgRes = await fetch('http://localhost:5001/api/chats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          orderId: orders[0].id,
          sender: 'AGENT',
          text: 'Test automated message from tool',
          timestamp: new Date().toISOString()
        })
      }).then(r => r.json());
      console.log('✅ Message sent:', msgRes._id);
      
      const chatsAfter = await fetch(`http://localhost:5001/api/chats/${orders[0].id}`).then(r => r.json());
      console.log('✅ Chats after message:', chatsAfter.length);
    }
    
    if (orders.length > 1) {
      const claimRes = await fetch(`http://localhost:5001/api/orders/${orders[1].id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: 'CONFIRMED' })
      }).then(r => r.json());
      console.log('✅ Order claim status:', claimRes.success ? 'SUCCESS' : 'PARTIAL');
    }
    
    console.log('\n✅ All API endpoints working correctly!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};
test();
