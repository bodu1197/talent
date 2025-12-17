-- chat_rooms 테이블의 service_id FK에 ON DELETE SET NULL 설정
-- 서비스 삭제 시 채팅방은 유지하고 service_id만 NULL로 설정

-- 1. 기존 FK 제약 조건 제거 (존재하는 경우)
DO $$ 
BEGIN
  -- 외래 키 이름을 찾아서 삭제
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_rooms_service_id_fkey' 
    AND table_name = 'chat_rooms'
  ) THEN
    ALTER TABLE public.chat_rooms DROP CONSTRAINT chat_rooms_service_id_fkey;
  END IF;
END $$;

-- 2. 새로운 FK 제약 조건 추가 (ON DELETE SET NULL)
-- 먼저 service_id가 NULL을 허용하는지 확인하고 추가
DO $$
BEGIN
  -- FK 추가 (이미 있을 수 있으므로 에러 무시)
  BEGIN
    ALTER TABLE public.chat_rooms 
    ADD CONSTRAINT chat_rooms_service_id_fkey 
    FOREIGN KEY (service_id) 
    REFERENCES public.services(id) 
    ON DELETE SET NULL;
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL; -- 이미 존재하면 무시
  END;
END $$;

-- 3. unique constraint 수정 - service_id가 NULL인 경우 중복 허용
-- PostgreSQL에서 NULL은 기본적으로 unique 제약 조건에서 distinct로 처리됨
-- 하지만 명시적으로 NULLS NOT DISTINCT가 설정되어 있을 수 있으므로 확인

-- 기존 unique constraint 확인 및 재생성
DO $$
BEGIN
  -- 기존 unique constraint가 있다면 삭제
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_rooms_user1_id_user2_id_service_id_key'
  ) THEN
    ALTER TABLE public.chat_rooms 
    DROP CONSTRAINT chat_rooms_user1_id_user2_id_service_id_key;
    
    -- NULL을 허용하는 새로운 unique constraint 생성
    -- PostgreSQL 15+ 에서는 NULLS NOT DISTINCT 옵션이 있지만
    -- 기본값은 NULLS DISTINCT 이므로 일반적인 unique constraint 재생성
    CREATE UNIQUE INDEX chat_rooms_user1_user2_service_idx 
    ON public.chat_rooms(user1_id, user2_id, service_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT chat_rooms_service_id_fkey ON public.chat_rooms IS 
'서비스 삭제 시 채팅방은 유지하고 service_id만 NULL로 설정';
