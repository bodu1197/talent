-- 9. RLS Policies

CREATE POLICY "System can insert activity logs" ON activity_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users and admins view activity logs" ON activity_logs FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT auth.uid() AS uid) = admin_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY admins_insert_own ON admins FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY admins_select_own ON admins FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY admins_update_policy ON admins FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Sellers manage own campaigns" ON advertising_campaigns FOR ALL TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR is_admin())) WITH CHECK (((( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY sellers_select_own_credits ON advertising_credits FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "모든 사용자는 노출 기록 조회 가능" ON advertising_impressions FOR SELECT TO public USING (true);
CREATE POLICY sellers_select_own_payments ON advertising_payments FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY sellers_select_own_subscriptions ON advertising_subscriptions FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY buyers_insert_own ON buyers FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY buyers_select_policy ON buyers FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY buyers_update_policy ON buyers FOR UPDATE TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Admins manage category deletion" ON categories FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Admins manage category insertion" ON categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Admins manage category updates" ON categories FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Everyone can view categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own visits" ON category_visits FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can update own visits" ON category_visits FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can view own visits" ON category_visits FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can delete their own favorites" ON chat_favorites FOR DELETE TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can insert their own favorites" ON chat_favorites FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can view their own favorites" ON chat_favorites FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Users can delete their own messages" ON chat_messages FOR DELETE TO public USING (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "Users can send messages to their chat rooms" ON chat_messages FOR INSERT TO public WITH CHECK (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "Users can update messages in their rooms" ON chat_messages FOR UPDATE TO public USING (((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))) AND ((sender_id = ( SELECT auth.uid() AS uid)) OR ((sender_id <> ( SELECT auth.uid() AS uid)) AND (is_read IS DISTINCT FROM true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users can view messages in their chat rooms" ON chat_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM chat_rooms
  WHERE ((chat_rooms.id = chat_messages.room_id) AND ((chat_rooms.user1_id = ( SELECT auth.uid() AS uid)) OR (chat_rooms.user2_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT TO public WITH CHECK (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Users can update their chat rooms" ON chat_rooms FOR UPDATE TO public USING (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms FOR SELECT TO public USING (((user1_id = ( SELECT auth.uid() AS uid)) OR (user2_id = ( SELECT auth.uid() AS uid))));
CREATE POLICY "Allow admins to delete company info" ON company_info FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow admins to insert company info" ON company_info FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow admins to update company info" ON company_info FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Allow public read access to company info" ON company_info FOR SELECT TO public USING (true);
CREATE POLICY "Users create conversations" ON conversations FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = participant1_id) OR (( SELECT auth.uid() AS uid) = participant2_id)));
CREATE POLICY sellers_select_own_transactions ON credit_transactions FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "분쟁 조회 권한" ON disputes FOR SELECT TO public USING (((initiated_by = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = disputes.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "사용자는 자신의 주문에 대해 분쟁 생성 가능" ON disputes FOR INSERT TO public WITH CHECK (((initiated_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = disputes.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "중재자는 분쟁 업데이트 가능" ON disputes FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers view own earnings transactions" ON earnings_transactions FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY errand_applications_delete_policy ON errand_applications FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))));
CREATE POLICY errand_applications_insert_policy ON errand_applications FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))));
CREATE POLICY errand_applications_select_policy ON errand_applications FOR SELECT TO public USING (true);
CREATE POLICY errand_applications_update_policy ON errand_applications FOR UPDATE TO public USING (((( SELECT auth.uid() AS uid) = ( SELECT helper_profiles.user_id
   FROM helper_profiles
  WHERE (helper_profiles.id = errand_applications.helper_id))) OR (( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_applications.errand_id)))));
CREATE POLICY errand_chat_messages_insert_policy ON errand_chat_messages FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (errands e
     JOIN profiles p ON ((p.user_id = ( SELECT auth.uid() AS uid))))
  WHERE ((e.id = errand_chat_messages.errand_id) AND ((e.requester_id = p.id) OR (e.helper_id = p.id)) AND (errand_chat_messages.sender_id = p.id)))));
CREATE POLICY errand_chat_messages_select_policy ON errand_chat_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM (errands e
     JOIN profiles p ON ((p.user_id = ( SELECT auth.uid() AS uid))))
  WHERE ((e.id = errand_chat_messages.errand_id) AND ((e.requester_id = p.id) OR (e.helper_id = p.id))))));
CREATE POLICY errand_chat_messages_service_role_policy ON errand_chat_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY errand_chat_messages_update_policy ON errand_chat_messages FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (errand_chat_messages.sender_id = p.id)))));
CREATE POLICY errand_disputes_insert_policy ON errand_disputes FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reporter_id));
CREATE POLICY errand_disputes_select_policy ON errand_disputes FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = reporter_id) OR (( SELECT auth.uid() AS uid) = reported_id)));
CREATE POLICY errand_locations_insert_policy ON errand_locations FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = helper_id));
CREATE POLICY errand_locations_select_policy ON errand_locations FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_locations.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY errand_messages_insert_policy ON errand_messages FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = sender_id) AND (EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_messages.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY errand_messages_select_policy ON errand_messages FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM errands
  WHERE ((errands.id = errand_messages.errand_id) AND ((errands.requester_id IN ( SELECT profiles.id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))) OR (errands.helper_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY errand_reviews_insert_policy ON errand_reviews FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reviewer_id));
CREATE POLICY errand_reviews_select_policy ON errand_reviews FOR SELECT TO public USING (true);
CREATE POLICY errand_settlements_select_policy ON errand_settlements FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = errand_settlements.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY errand_stops_delete_policy ON errand_stops FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errand_stops_insert_policy ON errand_stops FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errand_stops_select_policy ON errand_stops FOR SELECT TO public USING (true);
CREATE POLICY errand_stops_update_policy ON errand_stops FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = ( SELECT p.user_id
   FROM (errands e
     JOIN profiles p ON ((e.requester_id = p.id)))
  WHERE (e.id = errand_stops.errand_id))));
CREATE POLICY errands_delete_policy ON errands FOR DELETE TO public USING ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY errands_insert_policy ON errands FOR INSERT TO public WITH CHECK ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY errands_select_policy ON errands FOR SELECT TO public USING (true);
CREATE POLICY errands_update_policy ON errands FOR UPDATE TO public USING ((requester_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY food_carts_user_access ON food_carts FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_menu_categories_owner_delete ON food_menu_categories FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_owner_insert ON food_menu_categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_owner_update ON food_menu_categories FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menu_categories.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menu_categories_public_read ON food_menu_categories FOR SELECT TO public USING ((is_active = true));
CREATE POLICY food_menu_option_groups_public_read ON food_menu_option_groups FOR SELECT TO public USING (true);
CREATE POLICY food_menu_option_items_public_read ON food_menu_option_items FOR SELECT TO public USING ((is_available = true));
CREATE POLICY food_menus_owner_delete ON food_menus FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_owner_insert ON food_menus FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_owner_update ON food_menus FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM food_stores
  WHERE ((food_stores.id = food_menus.store_id) AND (food_stores.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY food_menus_public_read ON food_menus FOR SELECT TO public USING ((is_available = true));
CREATE POLICY food_orders_customer_access ON food_orders FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = customer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = customer_id));
CREATE POLICY food_reviews_public_read ON food_reviews FOR SELECT TO public USING (true);
CREATE POLICY food_reviews_user_create ON food_reviews FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_store_favorites_user_access ON food_store_favorites FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY food_stores_insert ON food_stores FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_owner_delete ON food_stores FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_owner_update ON food_stores FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = owner_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = owner_id));
CREATE POLICY food_stores_public_read ON food_stores FOR SELECT TO public USING ((is_active = true));
CREATE POLICY helper_profiles_insert_policy ON helper_profiles FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY helper_profiles_select_policy ON helper_profiles FOR SELECT TO public USING (true);
CREATE POLICY helper_profiles_update_policy ON helper_profiles FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY helper_subscriptions_select_policy ON helper_subscriptions FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_subscriptions.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY helper_withdrawals_insert_policy ON helper_withdrawals FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_withdrawals.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY helper_withdrawals_select_policy ON helper_withdrawals FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM helper_profiles
  WHERE ((helper_profiles.id = helper_withdrawals.helper_id) AND (helper_profiles.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Send messages in conversations" ON messages FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = sender_id) AND (EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.participant1_id = ( SELECT auth.uid() AS uid)) OR (conversations.participant2_id = ( SELECT auth.uid() AS uid))))))));
CREATE POLICY "View conversation messages" ON messages FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM conversations
  WHERE ((conversations.id = messages.conversation_id) AND ((conversations.participant1_id = ( SELECT auth.uid() AS uid)) OR (conversations.participant2_id = ( SELECT auth.uid() AS uid)))))) OR is_admin()));
CREATE POLICY notices_delete ON notices FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY notices_insert ON notices FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY notices_select ON notices FOR SELECT TO public USING (((is_published = true) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY notices_update ON notices FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "사용자는 자신의 알림만 업데이트" ON notifications FOR UPDATE TO public USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "사용자는 자신의 알림만 조회" ON notifications FOR SELECT TO public USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "알림 생성 허용" ON notifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY order_settlements_insert ON order_settlements FOR INSERT TO public WITH CHECK (true);
CREATE POLICY order_settlements_select ON order_settlements FOR SELECT TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY order_settlements_update ON order_settlements FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Buyers create orders" ON orders FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Related users update orders" ON orders FOR UPDATE TO public USING (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin())) WITH CHECK (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "View related orders" ON orders FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "Admins can view page_views" ON page_views FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Anyone can insert page_views" ON page_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY payment_requests_buyer_update ON payment_requests FOR UPDATE TO public USING ((buyer_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((buyer_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY payment_requests_select ON payment_requests FOR SELECT TO public USING (((buyer_id = ( SELECT auth.uid() AS uid)) OR (seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY payment_requests_seller_insert ON payment_requests FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY payments_insert ON payments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY payments_select ON payments FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = payments.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "View visible portfolios or own portfolios" ON portfolio_items FOR SELECT TO public USING (((is_visible = true) OR (( SELECT auth.uid() AS uid) = seller_id)));
CREATE POLICY "Anyone can view portfolio-service links" ON portfolio_services FOR SELECT TO public USING (true);
CREATE POLICY "Sellers can link their own portfolios and services" ON portfolio_services FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM seller_portfolio sp
  WHERE ((sp.id = portfolio_services.portfolio_id) AND (sp.seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))))));
CREATE POLICY "Sellers can unlink their own portfolios and services" ON portfolio_services FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM seller_portfolio sp
  WHERE ((sp.id = portfolio_services.portfolio_id) AND (sp.seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))))));
CREATE POLICY "Campaign owners create placements" ON premium_placements FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM advertising_campaigns
  WHERE ((advertising_campaigns.id = premium_placements.campaign_id) AND (advertising_campaigns.seller_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "View active or own placements" ON premium_placements FOR SELECT TO public USING (((is_active = true) OR (EXISTS ( SELECT 1
   FROM advertising_campaigns
  WHERE ((advertising_campaigns.id = premium_placements.campaign_id) AND (advertising_campaigns.seller_id = ( SELECT auth.uid() AS uid))))) OR is_admin()));
CREATE POLICY profiles_delete_own ON profiles FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY profiles_select_all ON profiles FOR SELECT TO public USING (true);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Sellers create responses" ON quote_responses FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = seller_id));
CREATE POLICY "Sellers update own responses" ON quote_responses FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = seller_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = seller_id));
CREATE POLICY "View relevant quote responses" ON quote_responses FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = seller_id) OR (EXISTS ( SELECT 1
   FROM quotes
  WHERE ((quotes.id = quote_responses.quote_id) AND (quotes.buyer_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Buyers create quotes" ON quotes FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Buyers delete own quotes" ON quotes FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "Buyers update own quotes" ON quotes FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "View active or own quotes" ON quotes FOR SELECT TO public USING (((status = 'pending'::text) OR (( SELECT auth.uid() AS uid) = buyer_id)));
CREATE POLICY refunds_insert ON refunds FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = refunds.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY refunds_select ON refunds FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = refunds.order_id) AND ((orders.buyer_id = ( SELECT auth.uid() AS uid)) OR (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Admins update reports" ON reports FOR UPDATE TO public USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Create reports" ON reports FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = reporter_id));
CREATE POLICY "View own or managed reports" ON reports FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = reporter_id) OR is_admin()));
CREATE POLICY "Buyers create reviews" ON reviews FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = reviews.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Buyers update own reviews" ON reviews FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = buyer_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = buyer_id));
CREATE POLICY "View public or own reviews" ON reviews FOR SELECT TO public USING (((is_visible = true) OR (( SELECT auth.uid() AS uid) = buyer_id) OR (( SELECT auth.uid() AS uid) = seller_id) OR is_admin()));
CREATE POLICY "구매자는 수정 요청 생성 가능" ON revision_history FOR INSERT TO public WITH CHECK (((requested_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "수정 요청 이력 조회 권한" ON revision_history FOR SELECT TO public USING (((requested_by = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "판매자는 수정 완료 처리 가능" ON revision_history FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK (((completed_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = revision_history.order_id) AND (orders.seller_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Anyone can view schema migrations" ON schema_migrations FOR SELECT TO public USING (true);
CREATE POLICY "System can insert schema migrations" ON schema_migrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Insert search logs" ON search_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users and admins view search logs" ON search_logs FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = user_id) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "seller_earnings 생성 허용" ON seller_earnings FOR INSERT TO public WITH CHECK ((seller_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "수익 정보 조회 권한" ON seller_earnings FOR SELECT TO public USING (((seller_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "판매자는 자신의 수익 정보 업데이트 가능" ON seller_earnings FOR UPDATE TO public USING ((seller_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((seller_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "Anyone can view portfolio" ON seller_portfolio FOR SELECT TO public USING (true);
CREATE POLICY "Sellers can delete own portfolio" ON seller_portfolio FOR DELETE TO public USING ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Sellers can insert own portfolio" ON seller_portfolio FOR INSERT TO public WITH CHECK ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Sellers can update own portfolio" ON seller_portfolio FOR UPDATE TO public USING ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id))) WITH CHECK ((seller_id = ( SELECT get_seller_id(( SELECT auth.uid() AS uid)) AS get_seller_id)));
CREATE POLICY "Anyone can view seller public info" ON sellers FOR SELECT TO public USING (true);
CREATE POLICY sellers_insert_own ON sellers FOR INSERT TO public WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY sellers_update_policy ON sellers FOR UPDATE TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for service categories" ON service_categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can delete own favorites" ON service_favorites FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can insert own favorites" ON service_favorites FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY service_favorites_select ON service_favorites FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR (service_id IN ( SELECT s.id
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_delete_policy ON service_packages FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_insert_policy ON service_packages FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_packages_select_policy ON service_packages FOR SELECT TO public USING (true);
CREATE POLICY service_packages_update_policy ON service_packages FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE ((s.id = service_packages.service_id) AND (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revision_categories_insert_policy ON service_revision_categories FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (service_revisions
     JOIN sellers ON ((sellers.id = service_revisions.seller_id)))
  WHERE ((service_revisions.id = service_revision_categories.revision_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revision_categories_select_policy ON service_revision_categories FOR SELECT TO public USING ((is_admin() OR (EXISTS ( SELECT 1
   FROM (service_revisions
     JOIN sellers ON ((sellers.id = service_revisions.seller_id)))
  WHERE ((service_revisions.id = service_revision_categories.revision_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_delete_policy ON service_revisions FOR DELETE TO public USING ((((status)::text = 'rejected'::text) AND (EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_insert_policy ON service_revisions FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY service_revisions_select_policy ON service_revisions FOR SELECT TO public USING ((is_admin() OR (EXISTS ( SELECT 1
   FROM sellers
  WHERE ((sellers.id = service_revisions.seller_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY service_revisions_update_policy ON service_revisions FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Service owners can manage their service tags" ON service_tags FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM services
  WHERE ((services.id = service_tags.service_id) AND (services.seller_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM services
  WHERE ((services.id = service_tags.service_id) AND (services.seller_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Anyone can insert view logs" ON service_view_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can view service logs" ON service_view_logs FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM (services
     JOIN sellers ON ((sellers.id = services.seller_id)))
  WHERE ((services.id = service_view_logs.service_id) AND (sellers.user_id = ( SELECT auth.uid() AS uid))))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Users can delete own service views" ON service_views FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can insert own service views" ON service_views FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Users can update own service views" ON service_views FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY service_views_select ON service_views FOR SELECT TO public USING (((user_id = ( SELECT auth.uid() AS uid)) OR (service_id IN ( SELECT s.id
   FROM (services s
     JOIN sellers sel ON ((s.seller_id = sel.id)))
  WHERE (sel.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Authorized users can update services" ON services FOR UPDATE TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Sellers manage service deletion" ON services FOR DELETE TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers manage service insertion" ON services FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Users can view services" ON services FOR SELECT TO public USING (((status = 'active'::text) OR (seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Admins can view all settlement details" ON settlement_details FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "관리자는 정산 생성 가능" ON settlements FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "관리자는 정산 업데이트 가능" ON settlements FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "정산 내역 조회 권한" ON settlements FOR SELECT TO public USING (((seller_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM admins
  WHERE (admins.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY sellers_select_own_invoices ON tax_invoices FOR SELECT TO public USING ((subscription_id IN ( SELECT advertising_subscriptions.id
   FROM advertising_subscriptions
  WHERE (advertising_subscriptions.seller_id IN ( SELECT sellers.id
           FROM sellers
          WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "Users manage own wallet" ON user_wallets FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Service role can insert users" ON users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO public USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)));
CREATE POLICY users_select_policy ON users FOR SELECT TO public USING (((id = ( SELECT auth.uid() AS uid)) OR is_admin()));
CREATE POLICY "Admins can view daily stats" ON visitor_stats_daily FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert daily stats" ON visitor_stats_daily FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update daily stats" ON visitor_stats_daily FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can view hourly stats" ON visitor_stats_hourly FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert hourly stats" ON visitor_stats_hourly FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update hourly stats" ON visitor_stats_hourly FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can view monthly stats" ON visitor_stats_monthly FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.user_id = ( SELECT auth.uid() AS uid)) AND (admins.role = 'super_admin'::text)))));
CREATE POLICY "Service role can insert monthly stats" ON visitor_stats_monthly FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can update monthly stats" ON visitor_stats_monthly FOR UPDATE TO public USING (true);
CREATE POLICY "Users view own wallet transactions" ON wallet_transactions FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "Sellers can create withdrawal requests" ON withdrawal_requests FOR INSERT TO public WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers can update own pending withdrawals" ON withdrawal_requests FOR UPDATE TO public USING (((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))) AND (status = 'pending'::text))) WITH CHECK ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
CREATE POLICY "Sellers can view own withdrawal requests" ON withdrawal_requests FOR SELECT TO public USING ((seller_id IN ( SELECT sellers.id
   FROM sellers
  WHERE (sellers.user_id = ( SELECT auth.uid() AS uid)))));
