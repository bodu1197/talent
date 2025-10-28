drop trigger if exists "update_users_updated_at" on "public"."users";

revoke delete on table "public"."activity_logs" from "anon";

revoke insert on table "public"."activity_logs" from "anon";

revoke references on table "public"."activity_logs" from "anon";

revoke select on table "public"."activity_logs" from "anon";

revoke trigger on table "public"."activity_logs" from "anon";

revoke truncate on table "public"."activity_logs" from "anon";

revoke update on table "public"."activity_logs" from "anon";

revoke delete on table "public"."activity_logs" from "authenticated";

revoke insert on table "public"."activity_logs" from "authenticated";

revoke references on table "public"."activity_logs" from "authenticated";

revoke select on table "public"."activity_logs" from "authenticated";

revoke trigger on table "public"."activity_logs" from "authenticated";

revoke truncate on table "public"."activity_logs" from "authenticated";

revoke update on table "public"."activity_logs" from "authenticated";

revoke delete on table "public"."activity_logs" from "service_role";

revoke insert on table "public"."activity_logs" from "service_role";

revoke references on table "public"."activity_logs" from "service_role";

revoke select on table "public"."activity_logs" from "service_role";

revoke trigger on table "public"."activity_logs" from "service_role";

revoke truncate on table "public"."activity_logs" from "service_role";

revoke update on table "public"."activity_logs" from "service_role";

revoke delete on table "public"."admins" from "anon";

revoke insert on table "public"."admins" from "anon";

revoke references on table "public"."admins" from "anon";

revoke select on table "public"."admins" from "anon";

revoke trigger on table "public"."admins" from "anon";

revoke truncate on table "public"."admins" from "anon";

revoke update on table "public"."admins" from "anon";

revoke delete on table "public"."admins" from "authenticated";

revoke insert on table "public"."admins" from "authenticated";

revoke references on table "public"."admins" from "authenticated";

revoke select on table "public"."admins" from "authenticated";

revoke trigger on table "public"."admins" from "authenticated";

revoke truncate on table "public"."admins" from "authenticated";

revoke update on table "public"."admins" from "authenticated";

revoke delete on table "public"."admins" from "service_role";

revoke insert on table "public"."admins" from "service_role";

revoke references on table "public"."admins" from "service_role";

revoke select on table "public"."admins" from "service_role";

revoke trigger on table "public"."admins" from "service_role";

revoke truncate on table "public"."admins" from "service_role";

revoke update on table "public"."admins" from "service_role";

revoke delete on table "public"."advertising_campaigns" from "anon";

revoke insert on table "public"."advertising_campaigns" from "anon";

revoke references on table "public"."advertising_campaigns" from "anon";

revoke select on table "public"."advertising_campaigns" from "anon";

revoke trigger on table "public"."advertising_campaigns" from "anon";

revoke truncate on table "public"."advertising_campaigns" from "anon";

revoke update on table "public"."advertising_campaigns" from "anon";

revoke delete on table "public"."advertising_campaigns" from "authenticated";

revoke insert on table "public"."advertising_campaigns" from "authenticated";

revoke references on table "public"."advertising_campaigns" from "authenticated";

revoke select on table "public"."advertising_campaigns" from "authenticated";

revoke trigger on table "public"."advertising_campaigns" from "authenticated";

revoke truncate on table "public"."advertising_campaigns" from "authenticated";

revoke update on table "public"."advertising_campaigns" from "authenticated";

revoke delete on table "public"."advertising_campaigns" from "service_role";

revoke insert on table "public"."advertising_campaigns" from "service_role";

revoke references on table "public"."advertising_campaigns" from "service_role";

revoke select on table "public"."advertising_campaigns" from "service_role";

revoke trigger on table "public"."advertising_campaigns" from "service_role";

revoke truncate on table "public"."advertising_campaigns" from "service_role";

revoke update on table "public"."advertising_campaigns" from "service_role";

revoke delete on table "public"."ai_services" from "anon";

revoke insert on table "public"."ai_services" from "anon";

revoke references on table "public"."ai_services" from "anon";

revoke select on table "public"."ai_services" from "anon";

revoke trigger on table "public"."ai_services" from "anon";

revoke truncate on table "public"."ai_services" from "anon";

revoke update on table "public"."ai_services" from "anon";

revoke delete on table "public"."ai_services" from "authenticated";

revoke insert on table "public"."ai_services" from "authenticated";

revoke references on table "public"."ai_services" from "authenticated";

revoke select on table "public"."ai_services" from "authenticated";

revoke trigger on table "public"."ai_services" from "authenticated";

revoke truncate on table "public"."ai_services" from "authenticated";

revoke update on table "public"."ai_services" from "authenticated";

revoke delete on table "public"."ai_services" from "service_role";

revoke insert on table "public"."ai_services" from "service_role";

revoke references on table "public"."ai_services" from "service_role";

revoke select on table "public"."ai_services" from "service_role";

revoke trigger on table "public"."ai_services" from "service_role";

revoke truncate on table "public"."ai_services" from "service_role";

revoke update on table "public"."ai_services" from "service_role";

revoke delete on table "public"."categories" from "anon";

revoke insert on table "public"."categories" from "anon";

revoke references on table "public"."categories" from "anon";

revoke select on table "public"."categories" from "anon";

revoke trigger on table "public"."categories" from "anon";

revoke truncate on table "public"."categories" from "anon";

revoke update on table "public"."categories" from "anon";

revoke delete on table "public"."categories" from "authenticated";

revoke insert on table "public"."categories" from "authenticated";

revoke references on table "public"."categories" from "authenticated";

revoke select on table "public"."categories" from "authenticated";

revoke trigger on table "public"."categories" from "authenticated";

revoke truncate on table "public"."categories" from "authenticated";

revoke update on table "public"."categories" from "authenticated";

revoke delete on table "public"."categories" from "service_role";

revoke insert on table "public"."categories" from "service_role";

revoke references on table "public"."categories" from "service_role";

revoke select on table "public"."categories" from "service_role";

revoke trigger on table "public"."categories" from "service_role";

revoke truncate on table "public"."categories" from "service_role";

revoke update on table "public"."categories" from "service_role";

revoke delete on table "public"."conversations" from "anon";

revoke insert on table "public"."conversations" from "anon";

revoke references on table "public"."conversations" from "anon";

revoke select on table "public"."conversations" from "anon";

revoke trigger on table "public"."conversations" from "anon";

revoke truncate on table "public"."conversations" from "anon";

revoke update on table "public"."conversations" from "anon";

revoke delete on table "public"."conversations" from "authenticated";

revoke insert on table "public"."conversations" from "authenticated";

revoke references on table "public"."conversations" from "authenticated";

revoke select on table "public"."conversations" from "authenticated";

revoke trigger on table "public"."conversations" from "authenticated";

revoke truncate on table "public"."conversations" from "authenticated";

revoke update on table "public"."conversations" from "authenticated";

revoke delete on table "public"."conversations" from "service_role";

revoke insert on table "public"."conversations" from "service_role";

revoke references on table "public"."conversations" from "service_role";

revoke select on table "public"."conversations" from "service_role";

revoke trigger on table "public"."conversations" from "service_role";

revoke truncate on table "public"."conversations" from "service_role";

revoke update on table "public"."conversations" from "service_role";

revoke delete on table "public"."disputes" from "anon";

revoke insert on table "public"."disputes" from "anon";

revoke references on table "public"."disputes" from "anon";

revoke select on table "public"."disputes" from "anon";

revoke trigger on table "public"."disputes" from "anon";

revoke truncate on table "public"."disputes" from "anon";

revoke update on table "public"."disputes" from "anon";

revoke delete on table "public"."disputes" from "authenticated";

revoke insert on table "public"."disputes" from "authenticated";

revoke references on table "public"."disputes" from "authenticated";

revoke select on table "public"."disputes" from "authenticated";

revoke trigger on table "public"."disputes" from "authenticated";

revoke truncate on table "public"."disputes" from "authenticated";

revoke update on table "public"."disputes" from "authenticated";

revoke delete on table "public"."disputes" from "service_role";

revoke insert on table "public"."disputes" from "service_role";

revoke references on table "public"."disputes" from "service_role";

revoke select on table "public"."disputes" from "service_role";

revoke trigger on table "public"."disputes" from "service_role";

revoke truncate on table "public"."disputes" from "service_role";

revoke update on table "public"."disputes" from "service_role";

revoke delete on table "public"."favorites" from "anon";

revoke insert on table "public"."favorites" from "anon";

revoke references on table "public"."favorites" from "anon";

revoke select on table "public"."favorites" from "anon";

revoke trigger on table "public"."favorites" from "anon";

revoke truncate on table "public"."favorites" from "anon";

revoke update on table "public"."favorites" from "anon";

revoke delete on table "public"."favorites" from "authenticated";

revoke insert on table "public"."favorites" from "authenticated";

revoke references on table "public"."favorites" from "authenticated";

revoke select on table "public"."favorites" from "authenticated";

revoke trigger on table "public"."favorites" from "authenticated";

revoke truncate on table "public"."favorites" from "authenticated";

revoke update on table "public"."favorites" from "authenticated";

revoke delete on table "public"."favorites" from "service_role";

revoke insert on table "public"."favorites" from "service_role";

revoke references on table "public"."favorites" from "service_role";

revoke select on table "public"."favorites" from "service_role";

revoke trigger on table "public"."favorites" from "service_role";

revoke truncate on table "public"."favorites" from "service_role";

revoke update on table "public"."favorites" from "service_role";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke select on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."messages" from "authenticated";

revoke insert on table "public"."messages" from "authenticated";

revoke references on table "public"."messages" from "authenticated";

revoke select on table "public"."messages" from "authenticated";

revoke trigger on table "public"."messages" from "authenticated";

revoke truncate on table "public"."messages" from "authenticated";

revoke update on table "public"."messages" from "authenticated";

revoke delete on table "public"."messages" from "service_role";

revoke insert on table "public"."messages" from "service_role";

revoke references on table "public"."messages" from "service_role";

revoke select on table "public"."messages" from "service_role";

revoke trigger on table "public"."messages" from "service_role";

revoke truncate on table "public"."messages" from "service_role";

revoke update on table "public"."messages" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."orders" from "anon";

revoke insert on table "public"."orders" from "anon";

revoke references on table "public"."orders" from "anon";

revoke select on table "public"."orders" from "anon";

revoke trigger on table "public"."orders" from "anon";

revoke truncate on table "public"."orders" from "anon";

revoke update on table "public"."orders" from "anon";

revoke delete on table "public"."orders" from "authenticated";

revoke insert on table "public"."orders" from "authenticated";

revoke references on table "public"."orders" from "authenticated";

revoke select on table "public"."orders" from "authenticated";

revoke trigger on table "public"."orders" from "authenticated";

revoke truncate on table "public"."orders" from "authenticated";

revoke update on table "public"."orders" from "authenticated";

revoke delete on table "public"."orders" from "service_role";

revoke insert on table "public"."orders" from "service_role";

revoke references on table "public"."orders" from "service_role";

revoke select on table "public"."orders" from "service_role";

revoke trigger on table "public"."orders" from "service_role";

revoke truncate on table "public"."orders" from "service_role";

revoke update on table "public"."orders" from "service_role";

revoke delete on table "public"."payments" from "anon";

revoke insert on table "public"."payments" from "anon";

revoke references on table "public"."payments" from "anon";

revoke select on table "public"."payments" from "anon";

revoke trigger on table "public"."payments" from "anon";

revoke truncate on table "public"."payments" from "anon";

revoke update on table "public"."payments" from "anon";

revoke delete on table "public"."payments" from "authenticated";

revoke insert on table "public"."payments" from "authenticated";

revoke references on table "public"."payments" from "authenticated";

revoke select on table "public"."payments" from "authenticated";

revoke trigger on table "public"."payments" from "authenticated";

revoke truncate on table "public"."payments" from "authenticated";

revoke update on table "public"."payments" from "authenticated";

revoke delete on table "public"."payments" from "service_role";

revoke insert on table "public"."payments" from "service_role";

revoke references on table "public"."payments" from "service_role";

revoke select on table "public"."payments" from "service_role";

revoke trigger on table "public"."payments" from "service_role";

revoke truncate on table "public"."payments" from "service_role";

revoke update on table "public"."payments" from "service_role";

revoke delete on table "public"."premium_placements" from "anon";

revoke insert on table "public"."premium_placements" from "anon";

revoke references on table "public"."premium_placements" from "anon";

revoke select on table "public"."premium_placements" from "anon";

revoke trigger on table "public"."premium_placements" from "anon";

revoke truncate on table "public"."premium_placements" from "anon";

revoke update on table "public"."premium_placements" from "anon";

revoke delete on table "public"."premium_placements" from "authenticated";

revoke insert on table "public"."premium_placements" from "authenticated";

revoke references on table "public"."premium_placements" from "authenticated";

revoke select on table "public"."premium_placements" from "authenticated";

revoke trigger on table "public"."premium_placements" from "authenticated";

revoke truncate on table "public"."premium_placements" from "authenticated";

revoke update on table "public"."premium_placements" from "authenticated";

revoke delete on table "public"."premium_placements" from "service_role";

revoke insert on table "public"."premium_placements" from "service_role";

revoke references on table "public"."premium_placements" from "service_role";

revoke select on table "public"."premium_placements" from "service_role";

revoke trigger on table "public"."premium_placements" from "service_role";

revoke truncate on table "public"."premium_placements" from "service_role";

revoke update on table "public"."premium_placements" from "service_role";

revoke delete on table "public"."refunds" from "anon";

revoke insert on table "public"."refunds" from "anon";

revoke references on table "public"."refunds" from "anon";

revoke select on table "public"."refunds" from "anon";

revoke trigger on table "public"."refunds" from "anon";

revoke truncate on table "public"."refunds" from "anon";

revoke update on table "public"."refunds" from "anon";

revoke delete on table "public"."refunds" from "authenticated";

revoke insert on table "public"."refunds" from "authenticated";

revoke references on table "public"."refunds" from "authenticated";

revoke select on table "public"."refunds" from "authenticated";

revoke trigger on table "public"."refunds" from "authenticated";

revoke truncate on table "public"."refunds" from "authenticated";

revoke update on table "public"."refunds" from "authenticated";

revoke delete on table "public"."refunds" from "service_role";

revoke insert on table "public"."refunds" from "service_role";

revoke references on table "public"."refunds" from "service_role";

revoke select on table "public"."refunds" from "service_role";

revoke trigger on table "public"."refunds" from "service_role";

revoke truncate on table "public"."refunds" from "service_role";

revoke update on table "public"."refunds" from "service_role";

revoke delete on table "public"."reports" from "anon";

revoke insert on table "public"."reports" from "anon";

revoke references on table "public"."reports" from "anon";

revoke select on table "public"."reports" from "anon";

revoke trigger on table "public"."reports" from "anon";

revoke truncate on table "public"."reports" from "anon";

revoke update on table "public"."reports" from "anon";

revoke delete on table "public"."reports" from "authenticated";

revoke insert on table "public"."reports" from "authenticated";

revoke references on table "public"."reports" from "authenticated";

revoke select on table "public"."reports" from "authenticated";

revoke trigger on table "public"."reports" from "authenticated";

revoke truncate on table "public"."reports" from "authenticated";

revoke update on table "public"."reports" from "authenticated";

revoke delete on table "public"."reports" from "service_role";

revoke insert on table "public"."reports" from "service_role";

revoke references on table "public"."reports" from "service_role";

revoke select on table "public"."reports" from "service_role";

revoke trigger on table "public"."reports" from "service_role";

revoke truncate on table "public"."reports" from "service_role";

revoke update on table "public"."reports" from "service_role";

revoke delete on table "public"."reviews" from "anon";

revoke insert on table "public"."reviews" from "anon";

revoke references on table "public"."reviews" from "anon";

revoke select on table "public"."reviews" from "anon";

revoke trigger on table "public"."reviews" from "anon";

revoke truncate on table "public"."reviews" from "anon";

revoke update on table "public"."reviews" from "anon";

revoke delete on table "public"."reviews" from "authenticated";

revoke insert on table "public"."reviews" from "authenticated";

revoke references on table "public"."reviews" from "authenticated";

revoke select on table "public"."reviews" from "authenticated";

revoke trigger on table "public"."reviews" from "authenticated";

revoke truncate on table "public"."reviews" from "authenticated";

revoke update on table "public"."reviews" from "authenticated";

revoke delete on table "public"."reviews" from "service_role";

revoke insert on table "public"."reviews" from "service_role";

revoke references on table "public"."reviews" from "service_role";

revoke select on table "public"."reviews" from "service_role";

revoke trigger on table "public"."reviews" from "service_role";

revoke truncate on table "public"."reviews" from "service_role";

revoke update on table "public"."reviews" from "service_role";

revoke delete on table "public"."schema_migrations" from "anon";

revoke insert on table "public"."schema_migrations" from "anon";

revoke references on table "public"."schema_migrations" from "anon";

revoke select on table "public"."schema_migrations" from "anon";

revoke trigger on table "public"."schema_migrations" from "anon";

revoke truncate on table "public"."schema_migrations" from "anon";

revoke update on table "public"."schema_migrations" from "anon";

revoke delete on table "public"."schema_migrations" from "authenticated";

revoke insert on table "public"."schema_migrations" from "authenticated";

revoke references on table "public"."schema_migrations" from "authenticated";

revoke select on table "public"."schema_migrations" from "authenticated";

revoke trigger on table "public"."schema_migrations" from "authenticated";

revoke truncate on table "public"."schema_migrations" from "authenticated";

revoke update on table "public"."schema_migrations" from "authenticated";

revoke delete on table "public"."schema_migrations" from "service_role";

revoke insert on table "public"."schema_migrations" from "service_role";

revoke references on table "public"."schema_migrations" from "service_role";

revoke select on table "public"."schema_migrations" from "service_role";

revoke trigger on table "public"."schema_migrations" from "service_role";

revoke truncate on table "public"."schema_migrations" from "service_role";

revoke update on table "public"."schema_migrations" from "service_role";

revoke delete on table "public"."search_logs" from "anon";

revoke insert on table "public"."search_logs" from "anon";

revoke references on table "public"."search_logs" from "anon";

revoke select on table "public"."search_logs" from "anon";

revoke trigger on table "public"."search_logs" from "anon";

revoke truncate on table "public"."search_logs" from "anon";

revoke update on table "public"."search_logs" from "anon";

revoke delete on table "public"."search_logs" from "authenticated";

revoke insert on table "public"."search_logs" from "authenticated";

revoke references on table "public"."search_logs" from "authenticated";

revoke select on table "public"."search_logs" from "authenticated";

revoke trigger on table "public"."search_logs" from "authenticated";

revoke truncate on table "public"."search_logs" from "authenticated";

revoke update on table "public"."search_logs" from "authenticated";

revoke delete on table "public"."search_logs" from "service_role";

revoke insert on table "public"."search_logs" from "service_role";

revoke references on table "public"."search_logs" from "service_role";

revoke select on table "public"."search_logs" from "service_role";

revoke trigger on table "public"."search_logs" from "service_role";

revoke truncate on table "public"."search_logs" from "service_role";

revoke update on table "public"."search_logs" from "service_role";

revoke delete on table "public"."service_categories" from "anon";

revoke insert on table "public"."service_categories" from "anon";

revoke references on table "public"."service_categories" from "anon";

revoke select on table "public"."service_categories" from "anon";

revoke trigger on table "public"."service_categories" from "anon";

revoke truncate on table "public"."service_categories" from "anon";

revoke update on table "public"."service_categories" from "anon";

revoke delete on table "public"."service_categories" from "authenticated";

revoke insert on table "public"."service_categories" from "authenticated";

revoke references on table "public"."service_categories" from "authenticated";

revoke select on table "public"."service_categories" from "authenticated";

revoke trigger on table "public"."service_categories" from "authenticated";

revoke truncate on table "public"."service_categories" from "authenticated";

revoke update on table "public"."service_categories" from "authenticated";

revoke delete on table "public"."service_categories" from "service_role";

revoke insert on table "public"."service_categories" from "service_role";

revoke references on table "public"."service_categories" from "service_role";

revoke select on table "public"."service_categories" from "service_role";

revoke trigger on table "public"."service_categories" from "service_role";

revoke truncate on table "public"."service_categories" from "service_role";

revoke update on table "public"."service_categories" from "service_role";

revoke delete on table "public"."service_packages" from "anon";

revoke insert on table "public"."service_packages" from "anon";

revoke references on table "public"."service_packages" from "anon";

revoke select on table "public"."service_packages" from "anon";

revoke trigger on table "public"."service_packages" from "anon";

revoke truncate on table "public"."service_packages" from "anon";

revoke update on table "public"."service_packages" from "anon";

revoke delete on table "public"."service_packages" from "authenticated";

revoke insert on table "public"."service_packages" from "authenticated";

revoke references on table "public"."service_packages" from "authenticated";

revoke select on table "public"."service_packages" from "authenticated";

revoke trigger on table "public"."service_packages" from "authenticated";

revoke truncate on table "public"."service_packages" from "authenticated";

revoke update on table "public"."service_packages" from "authenticated";

revoke delete on table "public"."service_packages" from "service_role";

revoke insert on table "public"."service_packages" from "service_role";

revoke references on table "public"."service_packages" from "service_role";

revoke select on table "public"."service_packages" from "service_role";

revoke trigger on table "public"."service_packages" from "service_role";

revoke truncate on table "public"."service_packages" from "service_role";

revoke update on table "public"."service_packages" from "service_role";

revoke delete on table "public"."service_tags" from "anon";

revoke insert on table "public"."service_tags" from "anon";

revoke references on table "public"."service_tags" from "anon";

revoke select on table "public"."service_tags" from "anon";

revoke trigger on table "public"."service_tags" from "anon";

revoke truncate on table "public"."service_tags" from "anon";

revoke update on table "public"."service_tags" from "anon";

revoke delete on table "public"."service_tags" from "authenticated";

revoke insert on table "public"."service_tags" from "authenticated";

revoke references on table "public"."service_tags" from "authenticated";

revoke select on table "public"."service_tags" from "authenticated";

revoke trigger on table "public"."service_tags" from "authenticated";

revoke truncate on table "public"."service_tags" from "authenticated";

revoke update on table "public"."service_tags" from "authenticated";

revoke delete on table "public"."service_tags" from "service_role";

revoke insert on table "public"."service_tags" from "service_role";

revoke references on table "public"."service_tags" from "service_role";

revoke select on table "public"."service_tags" from "service_role";

revoke trigger on table "public"."service_tags" from "service_role";

revoke truncate on table "public"."service_tags" from "service_role";

revoke update on table "public"."service_tags" from "service_role";

revoke delete on table "public"."services" from "anon";

revoke insert on table "public"."services" from "anon";

revoke references on table "public"."services" from "anon";

revoke select on table "public"."services" from "anon";

revoke trigger on table "public"."services" from "anon";

revoke truncate on table "public"."services" from "anon";

revoke update on table "public"."services" from "anon";

revoke delete on table "public"."services" from "authenticated";

revoke insert on table "public"."services" from "authenticated";

revoke references on table "public"."services" from "authenticated";

revoke select on table "public"."services" from "authenticated";

revoke trigger on table "public"."services" from "authenticated";

revoke truncate on table "public"."services" from "authenticated";

revoke update on table "public"."services" from "authenticated";

revoke delete on table "public"."services" from "service_role";

revoke insert on table "public"."services" from "service_role";

revoke references on table "public"."services" from "service_role";

revoke select on table "public"."services" from "service_role";

revoke trigger on table "public"."services" from "service_role";

revoke truncate on table "public"."services" from "service_role";

revoke update on table "public"."services" from "service_role";

revoke delete on table "public"."settlement_details" from "anon";

revoke insert on table "public"."settlement_details" from "anon";

revoke references on table "public"."settlement_details" from "anon";

revoke select on table "public"."settlement_details" from "anon";

revoke trigger on table "public"."settlement_details" from "anon";

revoke truncate on table "public"."settlement_details" from "anon";

revoke update on table "public"."settlement_details" from "anon";

revoke delete on table "public"."settlement_details" from "authenticated";

revoke insert on table "public"."settlement_details" from "authenticated";

revoke references on table "public"."settlement_details" from "authenticated";

revoke select on table "public"."settlement_details" from "authenticated";

revoke trigger on table "public"."settlement_details" from "authenticated";

revoke truncate on table "public"."settlement_details" from "authenticated";

revoke update on table "public"."settlement_details" from "authenticated";

revoke delete on table "public"."settlement_details" from "service_role";

revoke insert on table "public"."settlement_details" from "service_role";

revoke references on table "public"."settlement_details" from "service_role";

revoke select on table "public"."settlement_details" from "service_role";

revoke trigger on table "public"."settlement_details" from "service_role";

revoke truncate on table "public"."settlement_details" from "service_role";

revoke update on table "public"."settlement_details" from "service_role";

revoke delete on table "public"."settlements" from "anon";

revoke insert on table "public"."settlements" from "anon";

revoke references on table "public"."settlements" from "anon";

revoke select on table "public"."settlements" from "anon";

revoke trigger on table "public"."settlements" from "anon";

revoke truncate on table "public"."settlements" from "anon";

revoke update on table "public"."settlements" from "anon";

revoke delete on table "public"."settlements" from "authenticated";

revoke insert on table "public"."settlements" from "authenticated";

revoke references on table "public"."settlements" from "authenticated";

revoke select on table "public"."settlements" from "authenticated";

revoke trigger on table "public"."settlements" from "authenticated";

revoke truncate on table "public"."settlements" from "authenticated";

revoke update on table "public"."settlements" from "authenticated";

revoke delete on table "public"."settlements" from "service_role";

revoke insert on table "public"."settlements" from "service_role";

revoke references on table "public"."settlements" from "service_role";

revoke select on table "public"."settlements" from "service_role";

revoke trigger on table "public"."settlements" from "service_role";

revoke truncate on table "public"."settlements" from "service_role";

revoke update on table "public"."settlements" from "service_role";

revoke delete on table "public"."tags" from "anon";

revoke insert on table "public"."tags" from "anon";

revoke references on table "public"."tags" from "anon";

revoke select on table "public"."tags" from "anon";

revoke trigger on table "public"."tags" from "anon";

revoke truncate on table "public"."tags" from "anon";

revoke update on table "public"."tags" from "anon";

revoke delete on table "public"."tags" from "authenticated";

revoke insert on table "public"."tags" from "authenticated";

revoke references on table "public"."tags" from "authenticated";

revoke select on table "public"."tags" from "authenticated";

revoke trigger on table "public"."tags" from "authenticated";

revoke truncate on table "public"."tags" from "authenticated";

revoke update on table "public"."tags" from "authenticated";

revoke delete on table "public"."tags" from "service_role";

revoke insert on table "public"."tags" from "service_role";

revoke references on table "public"."tags" from "service_role";

revoke select on table "public"."tags" from "service_role";

revoke trigger on table "public"."tags" from "service_role";

revoke truncate on table "public"."tags" from "service_role";

revoke update on table "public"."tags" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);

CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_buyer()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.buyers
        WHERE id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sellers
        WHERE id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_service_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR (TG_OP = 'UPDATE' AND NEW.title IS DISTINCT FROM OLD.title) THEN
        -- 기본 슬러그 생성 (한글 처리 포함)
        base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9가-힣]+', '-', 'g'));
        base_slug := TRIM(BOTH '-' FROM base_slug);

        final_slug := base_slug;

        -- 중복 체크 및 고유 슬러그 생성
        WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;

        NEW.slug := final_slug;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.users (id, email, name, phone, user_type, email_verified, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', '사용자'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        'buyer',  -- 기본값: 구매자
        false,
        true
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 존재하는 경우 무시
        RETURN NEW;
    WHEN OTHERS THEN
        -- 다른 에러는 로그만 남기고 계속 진행
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.owns_service(service_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.services
        WHERE id = service_id
        AND seller_id = auth.uid()
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "Sellers can create campaigns"
on "public"."advertising_campaigns"
as permissive
for insert
to public
with check ((is_seller() AND (auth.uid() = seller_id)));


create policy "Sellers can update own campaigns"
on "public"."advertising_campaigns"
as permissive
for update
to public
using (((auth.uid() = seller_id) OR is_admin()))
with check (((auth.uid() = seller_id) OR is_admin()));


create policy "Sellers can view own campaigns"
on "public"."advertising_campaigns"
as permissive
for select
to public
using (((auth.uid() = seller_id) OR is_admin()));


create policy "Categories are viewable by everyone"
on "public"."categories"
as permissive
for select
to public
using (((is_active = true) OR is_admin()));


create policy "Only admins can delete categories"
on "public"."categories"
as permissive
for delete
to public
using (is_admin());


create policy "Only admins can insert categories"
on "public"."categories"
as permissive
for insert
to public
with check (is_admin());


create policy "Only admins can update categories"
on "public"."categories"
as permissive
for update
to public
using (is_admin())
with check (is_admin());


create policy "Participants can view conversations"
on "public"."conversations"
as permissive
for select
to public
using (((auth.uid() = participant1_id) OR (auth.uid() = participant2_id) OR is_admin()));


create policy "Participants can view messages"
on "public"."messages"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND ((c.participant1_id = auth.uid()) OR (c.participant2_id = auth.uid()))))) OR is_admin()));


create policy "Related users can update orders"
on "public"."orders"
as permissive
for update
to public
using (((auth.uid() = buyer_id) OR (auth.uid() = seller_id) OR is_admin()));


create policy "Users can view own orders"
on "public"."orders"
as permissive
for select
to public
using (((auth.uid() = buyer_id) OR (auth.uid() = seller_id) OR is_admin()));


create policy "Users can view own payments"
on "public"."payments"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = payments.order_id) AND ((o.buyer_id = auth.uid()) OR (o.seller_id = auth.uid()))))) OR is_admin()));


create policy "Active placements are public"
on "public"."premium_placements"
as permissive
for select
to public
using (((is_active = true) OR (EXISTS ( SELECT 1
   FROM advertising_campaigns c
  WHERE ((c.id = premium_placements.campaign_id) AND ((c.seller_id = auth.uid()) OR is_admin()))))));


create policy "Only admins can update reports"
on "public"."reports"
as permissive
for update
to public
using (is_admin())
with check (is_admin());


create policy "Users can view own reports"
on "public"."reports"
as permissive
for select
to public
using (((auth.uid() = reporter_id) OR (auth.uid() = reported_user_id) OR is_admin()));


create policy "Public reviews are viewable by everyone"
on "public"."reviews"
as permissive
for select
to public
using (((is_visible = true) OR (buyer_id = auth.uid()) OR (seller_id = auth.uid()) OR is_admin()));


create policy "Active services are viewable by everyone"
on "public"."services"
as permissive
for select
to public
using (((status = 'active'::text) OR (seller_id = auth.uid()) OR is_admin()));


create policy "Sellers can create services"
on "public"."services"
as permissive
for insert
to public
with check ((is_seller() AND (auth.uid() = seller_id)));


create policy "Sellers can delete own services"
on "public"."services"
as permissive
for delete
to public
using (((auth.uid() = seller_id) OR is_admin()));


create policy "Sellers can update own services"
on "public"."services"
as permissive
for update
to public
using (((auth.uid() = seller_id) OR is_admin()))
with check (((auth.uid() = seller_id) OR is_admin()));


CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();



