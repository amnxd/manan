import CourseDetailClient from './CourseDetailClient';

export async function generateStaticParams() {
   return [{ id: '1' }];
}

export default function Page() {
   return <CourseDetailClient />;
}
