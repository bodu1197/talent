DO $$
BEGIN
    -- 1. profiles 테이블 업데이트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        UPDATE public.profiles
        SET profile_image = REPLACE(profile_image, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj')
        WHERE profile_image LIKE '%bpvfkkrlyrjkwgwmfrci%';
    END IF;

    -- 2. services 테이블 업데이트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
        UPDATE public.services
        SET thumbnail_url = REPLACE(thumbnail_url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj')
        WHERE thumbnail_url LIKE '%bpvfkkrlyrjkwgwmfrci%';

        UPDATE public.services
        SET description = REPLACE(description, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj')
        WHERE description LIKE '%bpvfkkrlyrjkwgwmfrci%';
    END IF;

    -- 3. seller_portfolio 테이블 업데이트 (존재 시)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seller_portfolio') THEN
        -- thumbnail_url 업데이트
        UPDATE public.seller_portfolio
        SET thumbnail_url = REPLACE(thumbnail_url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj')
        WHERE thumbnail_url LIKE '%bpvfkkrlyrjkwgwmfrci%';
        
        -- image_urls 배열 업데이트 (텍스트로 변환 후 교체하고 다시 배열로, 또는 unnest 사용)
        -- 간단하게 텍스트 치환 방식 사용
        UPDATE public.seller_portfolio
        SET image_urls = (
            SELECT array_agg(REPLACE(url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj'))
            FROM unnest(image_urls) AS url
        )
        WHERE array_to_string(image_urls, ',') LIKE '%bpvfkkrlyrjkwgwmfrci%';
    END IF;

    -- 4. portfolio_items 테이블 업데이트 (존재 시)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolio_items') THEN
        UPDATE public.portfolio_items
        SET thumbnail_url = REPLACE(thumbnail_url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj')
        WHERE thumbnail_url LIKE '%bpvfkkrlyrjkwgwmfrci%';

        UPDATE public.portfolio_items
        SET images = (
            SELECT array_agg(REPLACE(url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj'))
            FROM unnest(images) AS url
        )
        WHERE array_to_string(images, ',') LIKE '%bpvfkkrlyrjkwgwmfrci%';
    END IF;

    -- 5. portfolios 테이블 업데이트 (코드에 등장하므로 체크)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolios') THEN
        -- images 배열 업데이트
        UPDATE public.portfolios
        SET images = (
            SELECT array_agg(REPLACE(url, 'bpvfkkrlyrjkwgwmfrci', 'abroivxthindezdtdzmj'))
            FROM unnest(images) AS url
        )
        WHERE array_to_string(images, ',') LIKE '%bpvfkkrlyrjkwgwmfrci%';
    END IF;

END $$;
