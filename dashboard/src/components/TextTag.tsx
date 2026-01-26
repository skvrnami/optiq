import { getColorClasses } from '@/config/colors';
import { DataText } from '@/types/data';
import { Filter } from '@/types/filter';
import inputAuthors from '@data/authors.json';
import inputCities from '@data/cities.json';
import inputLocations from '@data/locations.json';
import { IconText } from './icons/Text';
import { IconExternalLink } from './icons/ExternalLink';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/card';
import { Separator } from './ui/separator';
import { IconAuthor } from './icons/Author';
import { IconDeposition } from './icons/Deposition';
import { CardSection, CardLink, UnknownValue } from './ui/card-section';

interface TextTagProps {
  text: DataText;
  filter: Filter;
}

const TextTag = ({ text, filter }: TextTagProps) => {
  const author = inputAuthors.find((author) => author.id === text.authorId);
  const institute = inputLocations.find((location) => location.id === text.locationId);
  const city = inputCities.find((city) => city.id === institute?.cityId);

  const colors = getColorClasses(text.state, filter);

  const formatText = (content: string) => {
    // Check if content contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(content);

    // Check if content contains list items
    const hasList = content.includes('\n') || content.includes('•') || content.includes('-');

    if (hasUrl) {
      return content.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`${colors.text} ${colors.textHover} flex items-center gap-1`}
            >
              <span className="text-sm truncate max-w-[400px]">{part}</span>
              <IconExternalLink className="size-4" />
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }

    if (hasList) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {content
            .split(/[\n•-]/)
            .filter(Boolean)
            .map((item, index) => (
              <li key={index} className={`text-sm ${colors.text}`}>
                {item.trim()}
              </li>
            ))}
        </ul>
      );
    }

    return <span className={`text-sm ${colors.text}`}>{content}</span>;
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className={`flex items-center gap-1 cursor-pointer ${colors.text} ${colors.fill}`}>
          <IconText className={`size-5 ${colors.fill} shrink-0`} />
          <div className={`text-sm font-medium truncate ${colors.text} ${colors.fill}`}>
            {text.title}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-[50em]">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <IconText className={`size-5 ${colors.fill} shrink-0`} />
              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate ${colors.text}`}>{text.title}</h4>
                {text.sigla && (
                  <p className="text-xs text-gray-500 truncate">Sigla: {text.sigla}</p>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 text-sm">
            <CardSection label="Author">
              <span className={`font-medium flex items-center gap-1 truncate ${colors.text}`}>
                <IconAuthor className="size-4 shrink-0" />
                {author?.name || <UnknownValue textUnknownClass={colors.textUnknown} />}
              </span>
            </CardSection>
            <CardSection label="Location">
              <span className={`font-medium flex items-center gap-1 truncate ${colors.text}`}>
                <IconDeposition className="size-4 shrink-0" />
                {institute?.nativeLabel || <UnknownValue textUnknownClass={colors.textUnknown} />}
              </span>
              {city && (
                <span className="text-xs text-gray-500 truncate pl-5">{city.cityLabel}</span>
              )}
            </CardSection>
            <CardSection label="Date">
              {text.date ? (
                <span className={`font-medium truncate ${colors.text}`}>{text.date}</span>
              ) : (
                <UnknownValue textUnknownClass={colors.textUnknown} />
              )}
            </CardSection>
          </div>
          {text.universalIncipit && (
            <>
              <Separator />
              <CardSection label="Universal Incipit">
                <div className={`text-sm text-wrap ${colors.text}`}>{formatText(text.universalIncipit)}</div>
              </CardSection>
            </>
          )}
          {text.translator && (
            <>
              <Separator />
              <CardSection label="Translator">
                <span className={`text-sm truncate ${colors.text}`}>{text.translator}</span>
                {text.translatedFrom && text.translatedTo && (
                  <span className="text-xs text-gray-500">
                    {text.translatedFrom} → {text.translatedTo}
                  </span>
                )}
              </CardSection>
            </>
          )}
          {text.editions && text.editions.length > 0 && (
            <>
              <Separator />
              <CardSection label="Editions">
                <div className="flex flex-col gap-1">
                  {text.editions.map((edition) => (
                    <CardLink key={edition.id} href={edition.link} colorClasses={colors}>
                      {edition.title}
                    </CardLink>
                  ))}
                </div>
              </CardSection>
            </>
          )}
          {text.manuscript && (
            <>
              <Separator />
              <CardSection label="Manuscript">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className={`text-sm truncate ${colors.text}`}>
                    {text.manuscript.location}
                  </span>
                  {text.manuscript.catalogue && (
                    <CardLink
                      href={text.manuscript.catalogueLink ?? '#'}
                      colorClasses={colors}
                    >
                      {text.manuscript.catalogue}
                    </CardLink>
                  )}
                  {text.manuscript.digitalCopy && (
                    <CardLink href={text.manuscript.digitalCopy} colorClasses={colors}>
                      Digital Copy
                    </CardLink>
                  )}
                  {text.manuscript.facsimile && (
                    <CardLink href={text.manuscript.facsimile} colorClasses={colors}>
                      Facsimile
                    </CardLink>
                  )}
                </div>
              </CardSection>
            </>
          )}
          {text.literature && (
            <>
              <Separator />
              <CardSection label="Literature">
                <div className={`text-sm text-wrap ${colors.text}`}>
                  {formatText(text.literature)}
                </div>
              </CardSection>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TextTag;
