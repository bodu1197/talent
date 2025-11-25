import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(
        `
        id,
        room_id,
        sender_id,
        message,
        is_read,
        created_at,
        file_url,
        file_name,
        file_size,
        file_type
      `
      )
      .eq('room_id', room_id)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Messages fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const sendersMap = new Map();

      for (const senderId of senderIds) {
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('display_name, business_name, profile_image')
          .eq('user_id', senderId)
          .maybeSingle();

        if (sellerProfile) {
          sendersMap.set(senderId, {
            id: senderId,
            name: sellerProfile.display_name || sellerProfile.business_name || 'Seller',
            profile_image: sellerProfile.profile_image,
          });
        } else {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('name, profile_image')
            .eq('user_id', senderId)
            .maybeSingle();

          sendersMap.set(senderId, {
            id: senderId,
            name: userProfile?.name || 'User',
            profile_image: userProfile?.profile_image || null,
          });
        }
      }

      for (const msg of messages) {
        (msg as Record<string, unknown>).sender = sendersMap.get(
          (msg as Record<string, unknown>).sender_id as string
        );
      }
    }

    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room_id)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ messages });
  } catch (error) {
    logger.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { room_id, message, file_url, file_name, file_size, file_type } = body;

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
    }

    if (!message && !file_url) {
      return NextResponse.json({ error: 'message or file is required' }, { status: 400 });
    }

    interface ChatMessageInsert {
      room_id: string;
      sender_id: string;
      message: string;
      file_url?: string;
      file_name?: string;
      file_size?: number;
      file_type?: string;
    }

    const insertData: ChatMessageInsert = {
      room_id,
      sender_id: user.id,
      message: message || '',
    };

    if (file_url) {
      insertData.file_url = file_url;
      insertData.file_name = file_name;
      insertData.file_size = file_size;
      insertData.file_type = file_type;
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert(insertData)
      .select(
        `
        id,
        room_id,
        sender_id,
        message,
        is_read,
        created_at,
        file_url,
        file_name,
        file_size,
        file_type
      `
      )
      .single();

    if (error) {
      logger.error('Message send error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('display_name, business_name, profile_image')
      .eq('user_id', user.id)
      .maybeSingle();

    const messageWithSender = newMessage as Record<string, unknown>;

    if (sellerProfile) {
      messageWithSender.sender = {
        id: user.id,
        name: sellerProfile.display_name || sellerProfile.business_name || 'Seller',
        profile_image: sellerProfile.profile_image,
      };
    } else {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('name, profile_image')
        .eq('user_id', user.id)
        .maybeSingle();

      messageWithSender.sender = {
        id: user.id,
        name: userProfile?.name || 'User',
        profile_image: userProfile?.profile_image || null,
      };
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    logger.error('Message send API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
