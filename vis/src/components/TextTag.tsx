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
          <div className="min-w-6 size-6">
            <IconText className="size-5" />
          </div>
          <div className={`text-sm font-medium truncate ${colors.text} ${colors.fill}`}>
            {text.title}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">
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
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500">Author</span>
              <span className={`font-medium flex items-center gap-1 truncate ${colors.text}`}>
                <IconAuthor className="size-4" />
                {author?.name || 'Unknown'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500">Location</span>
              <span className={`font-medium flex items-center gap-1 truncate ${colors.text}`}>
                <IconDeposition className="size-4" />
                {institute?.nativeLabel || 'Unknown'}
              </span>
              {city && <span className="text-xs text-gray-500 truncate">{city.cityLabel}</span>}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-500">Date</span>
              <span className={`font-medium truncate ${colors.text}`}>{text.date}</span>
            </div>
          </div>
          {text.universalIncipit && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Universal Incipit</span>
                <div className={`text-sm max-w-[400px] ${colors.text}`}>
                  {formatText(text.universalIncipit)}
                </div>
              </div>
            </>
          )}
          {text.translator && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Translator</span>
                <span className={`text-sm truncate ${colors.text}`}>{text.translator}</span>
                {text.translatedFrom && text.translatedTo && (
                  <span className="text-xs text-gray-500">
                    {text.translatedFrom} → {text.translatedTo}
                  </span>
                )}
              </div>
            </>
          )}
          {text.editions && text.editions.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Editions</span>
                <div className="flex flex-col gap-1">
                  {text.editions.map((edition) => (
                    <a
                      key={edition.id}
                      href={edition.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.textLink} ${colors.textHover} flex items-center gap-1`}
                    >
                      <span className="text-sm truncate max-w-[400px]">{edition.title}</span>
                      <IconExternalLink className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
          {text.manuscript && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Manuscript</span>
                <div className="flex flex-col gap-1">
                  <span className={`text-sm truncate ${colors.text}`}>
                    {text.manuscript.location}
                  </span>
                  {text.manuscript.catalogue && (
                    <a
                      href={text.manuscript.catalogueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.textLink} ${colors.textHover} flex items-center gap-1`}
                    >
                      <span className="text-sm">{text.manuscript.catalogue}</span>
                      <IconExternalLink className="size-4" />
                    </a>
                  )}
                  {text.manuscript.digitalCopy && (
                    <a
                      href={text.manuscript.digitalCopy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.textLink} ${colors.textHover} flex items-center gap-1`}
                    >
                      <span className="text-sm">Digital Copy</span>
                      <IconExternalLink className="size-4" />
                    </a>
                  )}
                  {text.manuscript.facsimile && (
                    <a
                      href={text.manuscript.facsimile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.textLink} ${colors.textHover} flex items-center gap-1`}
                    >
                      <span className="text-sm">Facsimile</span>
                      <IconExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
          {text.literature && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Literature</span>
                <div className={`text-sm max-w-[400px] text-wrap ${colors.text}`}>
                  {formatText(text.literature)}
                </div>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TextTag;
